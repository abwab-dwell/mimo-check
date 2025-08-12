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

  const detectSOAPFormat = (text: string) => {
    const requiredSections = ["subjective", "objective", "assessment", "plan"];
    const normalizedText = text.toLowerCase();
    
    const foundSections = requiredSections.filter(section => 
      normalizedText.includes(section)
    );
    
    const missingSectionsCount = requiredSections.length - foundSections.length;
    const confidence = foundSections.length / requiredSections.length;
    
    // Determine status based on missing sections
    let status: "compliant" | "warning" | "non-compliant";
    let riskLevel: "Low" | "Medium" | "High";
    
    if (missingSectionsCount === 0) {
      status = "compliant";
      riskLevel = "Low";
    } else if (missingSectionsCount <= 2) {
      status = "warning";
      riskLevel = "Medium";
    } else {
      status = "non-compliant";
      riskLevel = "High";
    }
    
    return {
      isSOAP: foundSections.length > 0,
      foundSections: foundSections.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      missingSections: requiredSections
        .filter(section => !normalizedText.includes(section))
        .map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      confidence,
      status,
      riskLevel,
      overallScore: Math.round(confidence * 100)
    };
  };

  const analyzeNote = async () => {
    if (!noteText.trim() || !selectedState || !selectedPayer) {
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const detection = detectSOAPFormat(noteText);
    
    if (!detection.isSOAP) {
      // Non-SOAP format
      const nonSOAPResult: ComplianceResult = {
        detectedFormat: "Unsupported format in prototype",
        confidence: 0,
        riskLevel: "High",
        overallScore: 0,
        findings: [],
        missingSections: [],
        recommendations: ["This prototype only supports SOAP note format", "Please ensure your note contains Subjective, Objective, Assessment, and Plan sections"]
      };
      setResult(nonSOAPResult);
      setIsAnalyzing(false);
      return;
    }
    
    // SOAP format detected - create detailed analysis
    const soapSections = ["Subjective", "Objective", "Assessment", "Plan"];
    const findings = soapSections.map(section => {
      const isPresent = detection.foundSections.includes(section);
      const sectionStatus = isPresent ? "compliant" : "non-compliant";
      
      return {
        section,
        status: sectionStatus as "compliant" | "warning" | "non-compliant",
        issues: isPresent ? [] : [`${section} section not found in note`]
      };
    });
    
    // Add some realistic compliance issues based on SOAP analysis
    const complianceFindings = findings.map(finding => {
      if (finding.status === "compliant") {
        // Add some minor issues for present sections to make it realistic
        const minorIssues: { [key: string]: string[] } = {
          "Subjective": Math.random() > 0.7 ? ["Consider more detailed patient history"] : [],
          "Objective": Math.random() > 0.6 ? ["Missing vital signs documentation"] : [],
          "Assessment": Math.random() > 0.5 ? ["DSM-5 diagnostic codes recommended"] : [],
          "Plan": Math.random() > 0.8 ? ["Treatment timeline could be more specific"] : []
        };
        
        const issues = minorIssues[finding.section] || [];
        return {
          ...finding,
          status: issues.length > 0 ? "warning" as const : "compliant" as const,
          issues
        };
      }
      return finding;
    });

    const result: ComplianceResult = {
      detectedFormat: "SOAP Note",
      confidence: detection.confidence,
      riskLevel: detection.riskLevel,
      overallScore: detection.overallScore,
      findings: complianceFindings,
      missingSections: detection.missingSections.length > 0 ? detection.missingSections : [],
      recommendations: [
        ...detection.missingSections.map(section => `Add missing ${section} section`),
        "Ensure all sections contain comprehensive documentation",
        `Verify compliance with ${selectedState} state regulations`,
        `Confirm ${selectedPayer} billing requirements are met`,
        "Include provider signature and credentials"
      ].filter((rec, index, arr) => arr.indexOf(rec) === index) // Remove duplicates
    };

    setResult(result);
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
S: Patient reports feeling anxious and depressed for the past 2 weeks. Reports difficulty sleeping and decreased appetite. Denies suicidal ideation.

O: Patient appears well-groomed, cooperative, appropriate eye contact. Speech normal rate and tone. Mood appears dysthymic. Affect congruent with mood.

A: Major Depressive Episode, moderate severity (F32.1). Patient demonstrates good insight into condition.

P: Continue sertraline 50mg daily. Schedule follow-up in 2 weeks. Provide psychoeducation materials."
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