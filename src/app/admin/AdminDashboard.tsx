'use client';

import { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Tag, 
  UserPlus, 
  LayoutDashboard,
  ExternalLink,
  Crown,
  Check,
  X
} from 'lucide-react';

type View = 'resumo' | 'usuarios' | 'leads' | 'influenciadores' | 'cupons';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<View>('resumo');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data.metrics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const SidebarItem = ({ id, label, icon: Icon }: { id: View, label: string, icon: any }) => (
    <div 
      className={`${styles.navItem} ${activeView === id ? styles.navItemActive : ''}`}
      onClick={() => setActiveView(id)}
    >
      <Icon className={styles.navItemIcon} />
      {label}
    </div>
  );

  return (
    <div className={styles.container}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Efeito Viral</h2>
        <nav className={styles.nav}>
          <SidebarItem id="resumo" label="Dashboard" icon={LayoutDashboard} />
          <SidebarItem id="usuarios" label="Usuários" icon={Users} />
          <SidebarItem id="leads" label="Leads Iniciais" icon={UserPlus} />
          <SidebarItem id="influenciadores" label="Influencers" icon={MessageSquare} />
          <SidebarItem id="cupons" label="Cupons" icon={Tag} />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        {activeView === 'resumo' && (
          <div>
            <header className={styles.header}>
              <h1 className={styles.title}>Painel Geral</h1>
              <p className="text-muted">Visão geral do ecossistema Efeito Viral.</p>
            </header>

            {loading ? (
              <p>Carregando métricas...</p>
            ) : (
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Faturamento Total</p>
                  <p className={styles.statValue}>R$ {stats?.totalRevenue?.toFixed(2)}</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Usuários Premium</p>
                  <p className={styles.statValue}>{stats?.premiumUsers}</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Novas Vendas (Hoje)</p>
                  <p className={styles.statValue}>{stats?.salesToday}</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Taxa de Conversão</p>
                  <p className={styles.statValue}>{stats?.conversionRate}%</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Leads Cadastrados (Não Compraram)</p>
                  <p className={styles.statValue}>{stats?.registeredLeads}</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Leads de Formulário</p>
                  <p className={styles.statValue}>{stats?.totalLeads}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OUTRAS VIEWS SERÃO IMPLEMENTADAS COMO COMPONENTES SEPARADOS OU BLOCOS CONDICIONAIS */}
        {activeView === 'usuarios' && <UsersList />}
        {activeView === 'leads' && <LeadsList />}
        {activeView === 'influenciadores' && <InfluencerManager />}
        {activeView === 'cupons' && <CouponManager />}
      </main>
    </div>
  );
}

// COMPONENTES DE SUB-VIEWS (Simplificados para esta etapa)

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const togglePremium = async (userId: string, current: boolean) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      body: JSON.stringify({ userId, isPremium: !current, plan: current ? 'FREE' : 'PREMIUM' })
    });
    // Atualizar lista localmente
    setUsers((prev: any) => prev.map((u: any) => u.id === userId ? { ...u, isPremium: !current, plan: current ? 'FREE' : 'PREMIUM' } : u));
  };

  return (
    <div>
      <h2 className={styles.title}>Gestão de Usuários</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome/Email</th>
              <th>Canal</th>
              <th>Status</th>
              <th>Nicho</th>
              <th>WhatsApp</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.name || 'Sem nome'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                </td>
                <td>{u.youtubeChannelName || '-'}</td>
                <td>
                  <span className={`${styles.badge} ${u.isPremium ? styles.badgePremium : styles.badgeFree}`}>
                    {u.isPremium ? 'PREMIUM' : 'FREE'}
                  </span>
                </td>
                <td>{u.niche || '-'}</td>
                <td>
                  {u.whatsapp ? (
                    <a href={`https://wa.me/${u.whatsapp.replace(/\D/g, '')}`} target="_blank" className={styles.whatsappLink}>
                      Conversar
                    </a>
                  ) : '-'}
                </td>
                <td>
                  <button 
                    onClick={() => togglePremium(u.id, u.isPremium)}
                    className={styles.actionBtn}
                  >
                    {u.isPremium ? 'Remover Pro' : 'Tornar Pro'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(data => {
      // Filtrar apenas usuários que converteram (não premium)
      setLeads(data.filter((u: any) => !u.isPremium));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h2 className={styles.title}>Leads de Cadastro (Gargalo)</h2>
      <p className="text-muted" style={{ marginBottom: '24px' }}>Usuários que criaram conta mas ainda não assinaram o Pro.</p>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome/Email</th>
              <th>Data Cadastro</th>
              <th>WhatsApp</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l: any) => (
              <tr key={l.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{l.name || 'Sem nome'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.email}</div>
                </td>
                <td>{new Date(l.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>
                  {l.whatsapp ? (
                    <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, '')}?text=Olá ${l.name || ''}, vi que você se cadastrou no Efeito Viral...`} target="_blank" className={styles.whatsappLink}>
                      Chamar no WhatsApp
                    </a>
                  ) : '-'}
                </td>
                <td>
                  <button className={styles.actionBtnSecondary}>Ver Detalhes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfluencerManager() {
  const [influencers, setInfluencers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', socialHandle: '', whatsapp: '', commissionRate: 0 });

  const loadInfluencers = () => {
    fetch('/api/admin/influencers').then(r => r.json()).then(setInfluencers);
  };

  useEffect(() => {
    loadInfluencers();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch('/api/admin/influencers', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    setShowModal(false);
    loadInfluencers();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 className={styles.title}>Influenciadores & Parceiros</h2>
        <button className={styles.actionBtn} onClick={() => setShowModal(true)}>+ Novo Influencer</button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#14141f', padding: '32px', borderRadius: '16px', width: '400px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '24px' }}>Cadastrar Influencer</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="Nome" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff' }} required />
              <input type="text" placeholder="Instagram/TikTok Handle" value={formData.socialHandle} onChange={e => setFormData({ ...formData, socialHandle: e.target.value })} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff' }} />
              <input type="text" placeholder="WhatsApp" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff' }} />
              <input type="number" placeholder="Comissão (%)" value={formData.commissionRate} onChange={e => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff' }} />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className={styles.actionBtn} style={{ flex: 1 }}>Salvar</button>
                <button type="button" onClick={() => setShowModal(false)} className={styles.actionBtnSecondary} style={{ flex: 1 }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Rede Social</th>
              <th>WhatsApp</th>
              <th>Comissão</th>
              <th>Cupons Ativos</th>
            </tr>
          </thead>
          <tbody>
            {influencers.map((i: any) => (
              <tr key={i.id}>
                <td style={{ fontWeight: 600 }}>{i.name}</td>
                <td>{i.socialHandle || '-'}</td>
                <td>{i.whatsapp || '-'}</td>
                <td>{i.commissionRate}%</td>
                <td>
                  {i.coupons?.map((c: any) => (
                    <span key={c.code} style={{ fontSize: '0.7rem', background: 'rgba(157, 78, 221, 0.2)', padding: '2px 8px', borderRadius: '4px', marginRight: '4px' }}>
                      {c.code} ({c.usageCount})
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: 0, influencerId: '' });

  const loadData = async () => {
    const [cRes, iRes] = await Promise.all([
      fetch('/api/admin/coupons'),
      fetch('/api/admin/influencers')
    ]);
    setCoupons(await cRes.json());
    setInfluencers(await iRes.json());
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    setShowModal(false);
    loadData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 className={styles.title}>Gestão de Cupons</h2>
        <button className={styles.actionBtn} onClick={() => setShowModal(true)}>+ Criar Cupom</button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#14141f', padding: '32px', borderRadius: '16px', width: '400px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '24px' }}>Novo Cupom</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="CÓDIGO (ex: VIRAL20)" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff' }} required />
              <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value })} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff' }}>
                <option value="PERCENTAGE">Porcentagem (%)</option>
                <option value="FIXED">Valor Fixo (R$)</option>
              </select>
              <input type="number" placeholder="Valor do Desconto" value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff' }} required />
              
              <select value={formData.influencerId} onChange={e => setFormData({ ...formData, influencerId: e.target.value })} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff' }}>
                <option value="">Nenhum Influencer (Geral)</option>
                {influencers.map((i: any) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className={styles.actionBtn} style={{ flex: 1 }}>Criar</button>
                <button type="button" onClick={() => setShowModal(false)} className={styles.actionBtnSecondary} style={{ flex: 1 }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Desconto</th>
              <th>Uso</th>
              <th>Influencer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c: any) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{c.code}</td>
                <td>{c.discountValue}{c.discountType === 'PERCENTAGE' ? '%' : ' R$'}</td>
                <td>{c.usageCount} {c.maxUsage ? `/ ${c.maxUsage}` : ''}</td>
                <td>{c.influencer?.name || 'Geral'}</td>
                <td>
                  <span className={`${styles.badge} ${c.isActive ? styles.badgePremium : styles.badgeFree}`}>
                    {c.isActive ? 'ATIVO' : 'INATIVO'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
