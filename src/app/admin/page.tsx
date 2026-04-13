import prisma from '@/lib/prisma';
import styles from './Admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const leads = await prisma.lead.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Painel de Leads</h1>
          <p className="text-muted">Gerencie as inscrições recebidas pelo Efeito Viral.</p>
        </div>
      </header>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total de Inscrições</p>
          <p className={styles.statValue}>{leads.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Novas Hoje</p>
          <p className={styles.statValue}>
            {leads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
      </section>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Nome</th>
              <th>Perfil Social</th>
              <th>Desafios</th>
            </tr>
          </thead>
          <tbody>
            {leads.length > 0 ? (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td className={styles.date}>
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    <br />
                    {new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ fontWeight: '600' }}>{lead.nome}</td>
                  <td>
                    <a 
                      href={lead.perfilSocial.startsWith('http') ? lead.perfilSocial : `https://${lead.perfilSocial}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.profileLink}
                    >
                      Ver Perfil ↗
                    </a>
                  </td>
                  <td className={styles.desafios}>{lead.desafios}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                  Nenhum lead cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
