import Link from 'next/link';

export default function Dashboard(){
  return <main className="page"><div className="overlay"><div className="container"><div className="brand">Brian Demo Dashboard</div><h1>Tonight's Requests</h1><div className="section"><ul className="dashboard-list"><li><strong>Rooster</strong><span>3 requests</span></li><li><strong>Nutshell</strong><span>2 requests</span></li><li><strong>Down in a Hole</strong><span>1 request</span></li></ul></div><h2>Future Suggestions</h2><div className="section"><ul className="dashboard-list"><li><strong>Man in the Box</strong><span>5 votes</span></li><li><strong>Them Bones</strong><span>2 votes</span></li></ul></div><Link className="btn" href="/request">Open Request Page</Link></div></div></main>
}
