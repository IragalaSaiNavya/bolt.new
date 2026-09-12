import { useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { UploadZone } from '@/components/UploadZone';
import { Architecture } from '@/components/Architecture';
import { RequestBrowser } from '@/components/RequestBrowser';
import { OutputTable } from '@/components/OutputTable';
import { Footer } from '@/components/Footer';
import { useAgentData } from '@/hooks/useAgentData';

function App() {
  const { data, handleFiles, resetToSample, uploading, uploadError, isUploaded } = useAgentData();
  const sectionRefs = {
    hero: useRef<HTMLDivElement>(null),
    upload: useRef<HTMLDivElement>(null),
    requests: useRef<HTMLDivElement>(null),
    architecture: useRef<HTMLDivElement>(null),
    output: useRef<HTMLDivElement>(null),
  };

  const handleNavigate = (section: string) => {
    const ref = sectionRefs[section as keyof typeof sectionRefs];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigate={handleNavigate} />
      <div ref={sectionRefs.hero}>
        <Hero onNavigate={handleNavigate} />
      </div>
      <div ref={sectionRefs.upload}>
        <UploadZone
          onFiles={handleFiles}
          onReset={resetToSample}
          uploading={uploading}
          error={uploadError}
          isUploaded={isUploaded}
          fileName={data.fileName}
          requestCount={data.processedRequests.length}
        />
      </div>
      <div ref={sectionRefs.requests}>
        <RequestBrowser requests={data.processedRequests} />
      </div>
      <div ref={sectionRefs.architecture}>
        <Architecture />
      </div>
      <div ref={sectionRefs.output}>
        <OutputTable data={data} />
      </div>
      <Footer />
    </div>
  );
}

export default App;
