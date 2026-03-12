/**
 * Contact Page – displays team members
 */

export default function Contact() {
  const teamMembers = [
    {
      name: "Steve Onsare",
      school: "Kapsabet High School",
      email: "steveonsare001@gmail.com",
    },
    {
      name: "Ryan Kipkoech",
      school: "Kapsabet High School",
      email: "ryankemboi67@gmail.com",
    },
    {
      name: "Alvan Baraka",
      school: "Kapsabet High School",
      email: "alvanbaraka@gmail.com",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/30 py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg">NaveEye</h1>
              <p className="text-xs text-muted-foreground">Road Damage Detection</p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</a>
            <a href="/about" className="text-sm text-muted-foreground hover:text-foreground">About</a>
            <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground font-semibold text-primary">Contact</a>
            <button className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center hover:bg-primary/30 transition-colors">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      <main className="container py-20">
        {/* Page title */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Contact Us</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Meet the team behind NaveEye, dedicated to improving road safety through AI-powered pothole detection.
          </p>
        </div>

        {/* Team grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl p-8 text-center hover:border-primary/60 transition-all hover:bg-primary/5"
            >
              {/* Avatar */}
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary/40 flex items-center justify-center">
                <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold mb-2">{member.name}</h3>

              {/* School */}
              <p className="text-sm text-muted-foreground mb-4">{member.school}</p>

              {/* Email */}
              <a
                href={`mailto:${member.email}`}
                className="text-sm text-primary hover:text-primary/80 transition-colors break-all"
              >
                {member.email}
              </a>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-20">
          <p className="text-muted-foreground mb-6">
            Have questions or want to collaborate? Reach out to any team member above.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            ← Back to Detection
          </a>
        </div>
      </main>
    </div>
  );
}
