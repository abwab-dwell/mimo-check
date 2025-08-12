import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, FileText, Brain, Shield } from "lucide-react";
import { ComplianceReport } from "./ComplianceReport";

interface ComplianceResult {
  detectedFormat: string;
  confidence: number;
  riskLevel: "Low" | "Medium" | "High";
  overallScore: number;
  findings: {
    section: string;
    status: "compliant" | "warning" | "non-compliant";
    issues: string[];
  }[];
  missingSections: string[];
  recommendations: string[];
}

export const ComplianceChecker = () => {
  const [noteText, setNoteText] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedPayer, setSelectedPayer] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ComplianceResult | null>(null);

  const analyzeNote = async () => {
    if (!noteText.trim() || !selectedState || !selectedPayer) {
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API call with realistic processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis result - in real app this would call your compliance engine
    const mockResult: ComplianceResult = {
      detectedFormat: "SOAP Note",
      confidence: 0.94,
      riskLevel: "Medium",
      overallScore: 78,
      findings: [
        {
          section: "Subjective",
          status: "compliant",
          issues: []
        },
        {
          section: "Objective",
          status: "warning",
          issues: ["Missing vital signs documentation", "Insufficient mental status exam details"]
        },
        {
          section: "Assessment",
          status: "non-compliant",
          issues: ["DSM-5 diagnosis not specified", "Risk assessment incomplete"]
        },
        {
          section: "Plan",
          status: "compliant",
          issues: []
        }
      ],
      missingSections: ["Provider signature", "Treatment timeline"],
      recommendations: [
        "Add specific DSM-5 diagnostic codes",
        "Include comprehensive risk assessment",
        "Document vital signs if medically relevant",
        "Ensure provider signature and credentials"
      ]
    };

    setResult(mockResult);
    setIsAnalyzing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "non-compliant":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card className="shadow-medical">
        <CardHeader className="bg-gradient-subtle">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Clinical Note Input</CardTitle>
          </div>
          <CardDescription>
            Paste your SOAP note below and select the appropriate state and payer type for compliance analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              Clinical Note Text
            </label>
            <Textarea
              id="note"
              placeholder="Paste your SOAP note here...

Example:
S: Patient reports feeling anxious and depressed for the past 2 weeks...
O: Patient appears well-groomed, cooperative, eye contact appropriate...
A: Major Depressive Episode, moderate severity...
P: Continue current medication regimen..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GA">Georgia (GA)</SelectItem>
                  <SelectItem value="NY">New York (NY)</SelectItem>
                  <SelectItem value="CA">California (CA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Payer Type</label>
              <Select value={selectedPayer} onValueChange={setSelectedPayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medicaid">Medicaid</SelectItem>
                  <SelectItem value="medicare">Medicare</SelectItem>
                  <SelectItem value="commercial">Commercial Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={analyzeNote} 
            disabled={!noteText.trim() || !selectedState || !selectedPayer || isAnalyzing}
            className="w-full bg-gradient-primary hover:opacity-90 shadow-medical"
            size="lg"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 animate-pulse" />
                Analyzing Compliance...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Run Compliance Check
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && !isAnalyzing && (
        <ComplianceReport result={result} state={selectedState} payer={selectedPayer} />
      )}

      {/* Processing Indicator */}
      {isAnalyzing && (
        <Card className="shadow-compliance">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Brain className="h-12 w-12 text-primary animate-pulse mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Analyzing Clinical Note</h3>
                <p className="text-muted-foreground">
                  Running compliance checks against {selectedState} regulations and {selectedPayer} requirements...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};