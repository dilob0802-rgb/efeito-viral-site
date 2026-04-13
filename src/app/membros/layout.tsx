import Sidebar from "@/components/Sidebar";

export default function MembrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#050508' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: '260px', 
        padding: '40px',
        color: '#fff'
      }}>
        {children}
      </main>
    </div>
  );
}
