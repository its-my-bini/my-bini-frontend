import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Bini - AI Girlfriend',
  description: 'Chat with your AI girlfriend powered by Web3',
  icons: {
    icon: '/my-bini.png',
    apple: '/my-bini.png',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{
  // theme (no-flash)
  var t=localStorage.getItem('mybini-theme');
  if(t&&t!=='ocean'){
    document.documentElement.setAttribute('data-theme',t);
    var m={purple:['#0f0a1a','#1e1530','#a855f7','#9333ea','#c084fc','#f3e8ff','#2a1d45','rgba(30,21,48,0.9)','rgba(30,21,48,0.8)','rgba(30,21,48,0.5)','#2d2045','rgba(216,180,254,0.7)','rgba(216,180,254,0.5)','rgba(216,180,254,0.4)','rgba(88,28,135,0.4)','rgba(88,28,135,0.3)','rgba(168,85,247,0.5)','rgba(88,28,135,0.4)','rgba(88,28,135,0.3)','rgba(168,85,247,0.2)','rgba(168,85,247,0.1)'],blue:['#0a1019','#152030','#3b82f6','#2563eb','#60a5fa','#dbeafe','#1a2d45','rgba(21,32,48,0.9)','rgba(21,32,48,0.8)','rgba(21,32,48,0.5)','#1e2d45','rgba(147,197,253,0.7)','rgba(147,197,253,0.5)','rgba(147,197,253,0.4)','rgba(30,58,138,0.4)','rgba(30,58,138,0.3)','rgba(59,130,246,0.5)','rgba(30,58,138,0.4)','rgba(30,58,138,0.3)','rgba(59,130,246,0.2)','rgba(59,130,246,0.1)'],green:['#0a1410','#152d20','#10b981','#059669','#34d399','#d1fae5','#1a3d2a','rgba(21,45,32,0.9)','rgba(21,45,32,0.8)','rgba(21,45,32,0.5)','#1e3d2e','rgba(110,231,183,0.7)','rgba(110,231,183,0.5)','rgba(110,231,183,0.4)','rgba(6,78,59,0.4)','rgba(6,78,59,0.3)','rgba(16,185,129,0.5)','rgba(6,78,59,0.4)','rgba(6,78,59,0.3)','rgba(16,185,129,0.2)','rgba(16,185,129,0.1)']};
    var v=m[t];
    if(v){
      var k=['--c-bg','--c-secondary','--c-primary','--c-primary-hover','--c-accent','--c-text-light','--c-svg-fill','--c-secondary-90','--c-secondary-80','--c-secondary-50','--c-secondary-light','--c-muted','--c-muted-dim','--c-muted-faint','--c-border','--c-border-light','--c-border-accent','--c-hover-bg','--c-surface','--c-primary-dim','--c-primary-faint'];
      var r=document.documentElement.style;
      for(var i=0;i<k.length;i++)r.setProperty(k[i],v[i]);
    }
  }

  // splash (pre-render, once per session)
  var sk='mybini:splash-shown:v1';
  if(sessionStorage.getItem(sk)!=='1'){
    sessionStorage.setItem(sk,'1');
    document.documentElement.setAttribute('data-splash','on');
    setTimeout(function(){document.documentElement.removeAttribute('data-splash');},1500);
  }
}catch(e){}`,
          }}
        />
      </head>
      <body className="antialiased bg-(--c-secondary)">
        <Providers>
          {children}
          <Toaster position="top-center" richColors theme="dark" />
        </Providers>
      </body>
    </html>
  );
}
