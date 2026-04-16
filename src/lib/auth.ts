import prisma from "./prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import { getMyChannel } from "./youtube";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais inválidas");
        }

        // ACESSO MESTRE DE EMERGÊNCIA (Normalizado para evitar erros de digitação)
        const emailInput = credentials.email.trim().toLowerCase();
        
        if (emailInput === "admin@efeitoviral.com" && credentials.password === "admin123") {
          return {
            id: "system-admin-efeito",
            email: "admin@efeitoviral.com",
            name: "Master Admin",
            role: "ADMIN",
            onboardingComplete: true,
            isPremium: true,
            plan: "PRO"
          } as any;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Usuário não encontrado");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Senha incorreta");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          onboardingComplete: user.onboardingComplete,
          youtubeChannelId: user.youtubeChannelId,
          youtubeChannelName: user.youtubeChannelName,
          youtubeChannelAvatar: user.youtubeChannelAvatar,
          niche: user.niche,
          mainGoal: user.mainGoal,
          painPoints: user.painPoints,
          subscribers: user.subscribers,
          isPremium: user.isPremium,
          plan: user.plan
        } as any;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        // Tentar capturar o canal IMEDIATAMENTE no login
        let channelData = null;
        if (account.access_token) {
           channelData = await getMyChannel(account.access_token);
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || channelData?.title || "Usuário Google",
              password: "",
              onboardingComplete: false,
              role: "USER",
              youtubeChannelId: channelData?.id,
              youtubeChannelName: channelData?.title,
              youtubeChannelAvatar: channelData?.thumbnail,
              subscribers: channelData?.subscriberCount
            }
          });
        } else {
            // Atualiza os dados do canal se mudaram ou estavam vazios
            await prisma.user.update({
                where: { email: user.email },
                data: {
                    youtubeChannelId: channelData?.id || existingUser.youtubeChannelId,
                    youtubeChannelName: channelData?.title || existingUser.youtubeChannelName,
                    youtubeChannelAvatar: channelData?.thumbnail || existingUser.youtubeChannelAvatar,
                    subscribers: channelData?.subscriberCount || existingUser.subscribers
                }
            });
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // Se houver trigger de login inicial
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.onboardingComplete = (user as any).onboardingComplete;
        token.youtubeChannelId = (user as any).youtubeChannelId;
        token.youtubeChannelName = (user as any).youtubeChannelName;
        token.youtubeChannelAvatar = (user as any).youtubeChannelAvatar;
        token.niche = (user as any).niche;
        token.mainGoal = (user as any).mainGoal;
        token.painPoints = (user as any).painPoints;
        token.subscribers = (user as any).subscribers;
      }

      // Sincronizar dados do banco para o token (garante imagem/nome atualizados)
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string }
        });
        if (dbUser) {
          token.onboardingComplete = dbUser.onboardingComplete;
          token.youtubeChannelId = dbUser.youtubeChannelId;
          token.youtubeChannelName = dbUser.youtubeChannelName;
          token.youtubeChannelAvatar = dbUser.youtubeChannelAvatar;
          token.subscribers = dbUser.subscribers;
          token.isPremium = dbUser.isPremium;
          token.plan = dbUser.plan;
        }
      }

      if (account && account.provider === "google" && token.email) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;

        await prisma.user.update({
          where: { email: token.email },
          data: {
            googleAccessToken: account.access_token,
            googleRefreshToken: account.refresh_token,
          }
        }).catch(e => console.error("Erro ao salvar tokens Google:", e));
      }

      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id as string;
        (session.user as any).onboardingComplete = token.onboardingComplete;
        (session.user as any).youtubeChannelId = token.youtubeChannelId;
        (session.user as any).youtubeChannelName = token.youtubeChannelName;
        (session.user as any).youtubeChannelAvatar = token.youtubeChannelAvatar;
        (session.user as any).niche = token.niche;
        (session.user as any).mainGoal = token.mainGoal;
        (session.user as any).painPoints = token.painPoints;
        (session.user as any).subscribers = token.subscribers;
        (session.user as any).isPremium = token.isPremium;
        (session.user as any).plan = token.plan;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
