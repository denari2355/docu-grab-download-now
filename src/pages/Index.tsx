import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useExtensionDownload } from "@/hooks/useExtensionDownload";
import { Download, FileText, Shield, Zap, Monitor, Chrome, MousePointer, X, CheckCircle, AlertCircle, Settings, Menu, Home, Info, BookOpen, Download as DownloadIcon, Star, Quote, Users, Scale, Eye } from "lucide-react";
const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const {
    downloadExtension,
    isDownloading
  } = useExtensionDownload();
  const {
    toast
  } = useToast();

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "features", "how-it-works", "installation", "testimonials", "download"];
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const {
            offsetTop,
            offsetHeight
          } = element;
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
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const handleDownload = () => {
    downloadExtension();
  };
  const features = [{
    icon: FileText,
    title: "Smart Document Detection",
    description: "Automatically detects all types of documents on any webpage including PDFs, DOCs, images, and more."
  }, {
    icon: MousePointer,
    title: "One-Click Downloads",
    description: "Simple download button appears below each document with an optional close button to minimize distractions."
  }, {
    icon: Shield,
    title: "Safe & Secure",
    description: "Built with security in mind. No data collection, no tracking, just pure functionality."
  }, {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed with minimal resource usage. Works seamlessly in the background."
  }, {
    icon: Monitor,
    title: "Cross-Browser Support",
    description: "Works perfectly with Chrome, Edge, and other Chromium-based browsers."
  }, {
    icon: Settings,
    title: "Customizable",
    description: "Adjust settings to match your workflow. Control button visibility and download behavior."
  }];
  return <div className="min-h-screen bg-gradient-hero">
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
              <button onClick={() => scrollToSection("home")} className={`text-sm font-medium transition-colors hover:text-primary ${activeSection === "home" ? "text-primary" : "text-muted-foreground"}`}>
                <Home className="inline w-4 h-4 mr-1" />
                Home
              </button>
              <button onClick={() => scrollToSection("features")} className={`text-sm font-medium transition-colors hover:text-primary ${activeSection === "features" ? "text-primary" : "text-muted-foreground"}`}>
                <Zap className="inline w-4 h-4 mr-1" />
                Features
              </button>
              <button onClick={() => scrollToSection("how-it-works")} className={`text-sm font-medium transition-colors hover:text-primary ${activeSection === "how-it-works" ? "text-primary" : "text-muted-foreground"}`}>
                <Info className="inline w-4 h-4 mr-1" />
                How It Works
              </button>
              <button onClick={() => scrollToSection("installation")} className={`text-sm font-medium transition-colors hover:text-primary ${activeSection === "installation" ? "text-primary" : "text-muted-foreground"}`}>
                <BookOpen className="inline w-4 h-4 mr-1" />
                Installation
              </button>
              <button onClick={() => scrollToSection("testimonials")} className={`text-sm font-medium transition-colors hover:text-primary ${activeSection === "testimonials" ? "text-primary" : "text-muted-foreground"}`}>
                <Users className="inline w-4 h-4 mr-1" />
                Testimonials
              </button>
            </div>

            <Button onClick={() => scrollToSection("download")} size="sm" className="hidden md:flex bg-gradient-primary hover:opacity-95 text-white">
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
            A powerful browser extension that intelligently detects and downloads documents from any webpage including iframes. 
            Works seamlessly with PDFs, DOCs, images, videos, and more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={handleDownload} disabled={isDownloading} className="px-8 py-6 text-lg font-semibold shadow-button-custom hover:shadow-lg transition-all duration-300">
              {isDownloading ? <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Preparing Download...
                </> : <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Extension
                </>}
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
            {features.map((feature, index) => <Card key={index} className="bg-gradient-card border-0 shadow-card-custom backdrop-blur-sm">
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
              </Card>)}
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

      {/* Testimonials Section */}
      <section id="testimonials" className="px-4 py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Users Say</h2>
            <p className="text-xl text-muted-foreground">
              Trusted by thousands of professionals worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-card border-0 shadow-card-custom">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Sarah Chen</CardTitle>
                    <CardDescription className="text-xs">Research Analyst</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Quote className="w-8 h-8 text-primary/30 mb-3" />
                <p className="text-sm leading-relaxed">
                  "FileGrabber has revolutionized how I collect research documents. The iframe detection is incredible - it finds PDFs I never knew were there!"
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card-custom">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Marcus Rodriguez</CardTitle>
                    <CardDescription className="text-xs">Legal Assistant</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Quote className="w-8 h-8 text-primary/30 mb-3" />
                <p className="text-sm leading-relaxed">
                  "As someone who downloads hundreds of legal documents daily, FileGrabber saves me hours. The one-click download is a game-changer."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card-custom">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Emily Johnson</CardTitle>
                    <CardDescription className="text-xs">Content Creator</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Quote className="w-8 h-8 text-primary/30 mb-3" />
                <p className="text-sm leading-relaxed">
                  "Perfect for content research! FileGrabber finds media files in places other tools miss. The cross-browser support is excellent."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="px-4 py-20 bg-gradient-primary text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Boost Your Productivity?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have streamlined their document workflow with FileGrabber.
          </p>
          
          <Button size="lg" variant="secondary" onClick={handleDownload} disabled={isDownloading} className="px-8 py-6 text-lg font-semibold">
            {isDownloading ? <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                Preparing Download...
              </> : <>
                <Download className="mr-2 h-5 w-5" />
                Download Now
              </>}
          </Button>
          
          <div className="mt-12 text-center text-sm opacity-80">
            <p className="mb-2">Version 1.0.0 • Manifest V3 Compliant</p>
            <p>Chrome & Edge Compatible</p>
          </div>
        </div>
      </section>

      {/* Disclaimer & Terms Section */}
      <section className="px-4 py-16 bg-muted/20 border-t">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Disclaimer
              </h3>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  FileGrabber is provided "as is" without warranty of any kind. Use this extension responsibly and in accordance with applicable laws and website terms of service.
                </p>
                <p>
                  Always respect copyright laws and website terms of use when downloading content. FileGrabber is intended for legitimate document access and should not be used to circumvent access controls or download copyrighted material without permission.
                </p>
                <p>
                  The extension may not work on all websites due to security restrictions, CORS policies, or other technical limitations.
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Terms of Use
              </h3>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  By downloading and using FileGrabber, you agree to use it only for legitimate purposes and in compliance with all applicable laws.
                </p>
                <p>
                  You are responsible for ensuring you have the right to download any content accessed through this extension. We are not responsible for any misuse of the extension.
                </p>
                <p>
                  The extension is open-source and provided for educational and productivity purposes. No data is collected or transmitted by the extension.
                </p>
                <p>
                  We reserve the right to update these terms and the extension functionality at any time.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
            <p> 2025 FileGrabber. Built for enhanced productivity and seamless document management.</p>
          </div>
        </div>
      </section>
    </div>;
};
export default Index;