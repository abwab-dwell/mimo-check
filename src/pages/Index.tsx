import { ComplianceChecker } from "@/components/ComplianceChecker";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileCheck, CheckCircle } from "lucide-react";
import mimoLogo from "/lovable-uploads/b66679ce-9310-4074-b164-b9a3b751384a.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-compliance">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <img 
              src={mimoLogo} 
              alt="Mimo AI Logo" 
              className="h-10 w-20 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Mimo AI
              </h1>
              <p className="text-sm text-muted-foreground">
                Mental Health Notes Compliance
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium text-primary mb-4">
              <Shield className="h-4 w-4" />
              BETA VERSION
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Clinical Note Compliance Analysis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Automatically detect SOAP note formats and run comprehensive compliance checks 
              against state regulations and payer requirements
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-compliance border-l-4 border-l-primary">
              <CardContent className="p-6 space-y-3">
                <div className="bg-primary/10 p-2 rounded-lg w-fit">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">SOAP Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically identifies note structure and validates SOAP format compliance
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-compliance border-l-4 border-l-accent">
              <CardContent className="p-6 space-y-3">
                <div className="bg-accent/10 p-2 rounded-lg w-fit">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold">Multi-State Rules</h3>
                <p className="text-sm text-muted-foreground">
                  Compliance checking for Georgia, New York, and California regulations
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-compliance border-l-4 border-l-success">
              <CardContent className="p-6 space-y-3">
                <div className="bg-success/10 p-2 rounded-lg w-fit">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <h3 className="font-semibold">Detailed Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Color-coded compliance reports with actionable recommendations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Application */}
          <ComplianceChecker />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Mimo AI Compliance Tool - Beta Version | 
              For demonstration purposes only
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;