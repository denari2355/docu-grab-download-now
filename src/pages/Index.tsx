import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  FileText, 
  Shield, 
  Zap, 
  Monitor,
  Chrome,
  MousePointer,
  X,
  CheckCircle,
  AlertCircle,
  Settings,
  Menu,
  Home,
  Info,
  BookOpen,
  Download as DownloadIcon
} from "lucide-react";

const Index = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { toast } = useToast();

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "features", "how-it-works", "installation", "download"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    
    // Simulate download delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Download Started",
      description: "FileGrabber extension is being downloaded...",
    });
    
    // Here you would trigger the actual download from Supabase
    // For now, we'll show a success message
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Check your downloads folder for the FileGrabber extension.",
      });
      setIsDownloading(false);
    }, 1000);
  };

  const features = [
    {
      icon: FileText,
      title: "Smart Document Detection",
      description: "Automatically detects all types of documents on any webpage including PDFs, DOCs, images, and more."
    },
    {
      icon: MousePointer,
      title: "One-Click Downloads",
      description: "Simple download button appears below each document with an optional close button to minimize distractions."
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Built with security in mind. No data collection, no tracking, just pure functionality."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed with minimal resource usage. Works seamlessly in the background."
    },
    {
      icon: Monitor,
      title: "Cross-Browser Support",
      description: "Works perfectly with Chrome, Edge, and other Chromium-based browsers."
    },
    {
      icon: Settings,
      title: "Customizable",
      description: "Adjust settings to match your workflow. Control button visibility and download behavior."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FileGrabber
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("home")}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === "home" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Home className="inline w-4 h-4 mr-1" />
                Home
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === "features" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Zap className="inline w-4 h-4 mr-1" />
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === "how-it-works" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Info className="inline w-4 h-4 mr-1" />
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("installation")}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === "installation" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <BookOpen className="inline w-4 h-4 mr-1" />
                Installation
              </button>
            </div>

            <Button
              onClick={() => scrollToSection("download")}
              size="sm"
              className="hidden md:flex bg-gradient-primary hover:opacity-95 text-white"
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download
            </Button>

            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative px-4 py-20 pt-32 text-center">{/* Added pt-32 for nav spacing */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-8 flex justify-center">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              Browser Extension
            </Badge>
          </div>
          
          <h1 className="mb-6 text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            FileGrabber
          </h1>
          
          <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
            A powerful browser extension that intelligently detects and downloads documents from any webpage. 
            Like IDM, but smarter and more intuitive.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-8 py-6 text-lg font-semibold shadow-button-custom hover:shadow-lg transition-all duration-300"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Preparing Download...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Extension
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Chrome className="h-4 w-4" />
              <span>Chrome & Edge Compatible</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose FileGrabber?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with modern web technologies and designed for the power user who needs efficiency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-card-custom backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-4 py-20 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple, intuitive, and powerful document detection
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Auto-Detection</h3>
              <p className="text-muted-foreground">
                FileGrabber automatically scans webpages for documents and files of all types.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <MousePointer className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Smart UI</h3>
              <p className="text-muted-foreground">
                A clean download button appears below detected documents with an optional close button.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. One-Click Download</h3>
              <p className="text-muted-foreground">
                Click the download button to instantly save the document to your preferred location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Instructions */}
      <section id="installation" className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Installation Guide</h2>
            <p className="text-xl text-muted-foreground">
              Get FileGrabber running in just a few simple steps
            </p>
          </div>
          
          <Card className="bg-gradient-card border-0 shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Installation Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Download & Extract</h4>
                  <p className="text-muted-foreground">
                    Download the FileGrabber extension file and extract it to a folder on your computer.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Open Browser Extensions</h4>
                  <p className="text-muted-foreground">
                    Navigate to <code className="bg-muted px-2 py-1 rounded">chrome://extensions/</code> in Chrome 
                    or <code className="bg-muted px-2 py-1 rounded">edge://extensions/</code> in Edge.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Enable Developer Mode</h4>
                  <p className="text-muted-foreground">
                    Toggle the "Developer mode" switch in the top right corner of the extensions page.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Load Extension</h4>
                  <p className="text-muted-foreground">
                    Click "Load unpacked" and select the folder where you extracted FileGrabber.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 dark:text-green-200 font-medium">
                  You're all set! FileGrabber will now work on all websites.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="px-4 py-20 bg-gradient-primary text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Boost Your Productivity?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have streamlined their document workflow with FileGrabber.
          </p>
          
          <Button 
            size="lg" 
            variant="secondary"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-8 py-6 text-lg font-semibold"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                Preparing Download...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Download Now
              </>
            )}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
