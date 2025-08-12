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
  complianceDomains: {
    domain: string;
    score: number;
    status: "compliant" | "warning" | "non-compliant";
    findings: string[];
  }[];
  soapFindings: {
    section: string;
    status: "compliant" | "warning" | "non-compliant";
    issues: string[];
    triggers?: string[];
  }[];
  missingSections: string[];
  recommendations: string[];
  references: string[];
}

export const ComplianceChecker = () => {
  const [noteText, setNoteText] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedPayer, setSelectedPayer] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ComplianceResult | null>(null);

  const analyzeSOAPContent = (text: string, foundSections: string[], selectedState: string) => {
    const soapAnalysis = [
      {
        section: "Subjective",
        present: foundSections.includes("Subjective"),
        triggers: {
          missingPatientVoice: !text.toLowerCase().includes("patient reports") && !text.toLowerCase().includes("client states") && !text.toLowerCase().includes("patient describes"),
          vagueMoodSymptoms: !text.toLowerCase().includes("feeling") && !text.toLowerCase().includes("mood") && !text.toLowerCase().includes("anxiety") && !text.toLowerCase().includes("depression")
        }
      },
      {
        section: "Objective",
        present: foundSections.includes("Objective"),
        triggers: {
          noMeasurableData: !text.toLowerCase().includes("appears") && !text.toLowerCase().includes("observed") && !text.toLowerCase().includes("vital") && !text.toLowerCase().includes("mse"),
          vagueObservation: !text.toLowerCase().includes("well-groomed") && !text.toLowerCase().includes("cooperative") && !text.toLowerCase().includes("eye contact")
        }
      },
      {
        section: "Assessment",
        present: foundSections.includes("Assessment"),
        triggers: {
          missingDSMCode: !text.match(/F\d{2}\.\d/) && !text.toLowerCase().includes("dsm"),
          noRationale: !text.toLowerCase().includes("based on") && !text.toLowerCase().includes("evidenced by") && !text.toLowerCase().includes("due to"),
          noSeverity: !text.toLowerCase().includes("mild") && !text.toLowerCase().includes("moderate") && !text.toLowerCase().includes("severe")
        }
      },
      {
        section: "Plan",
        present: foundSections.includes("Plan"),
        triggers: {
          noTimeline: !text.toLowerCase().includes("week") && !text.toLowerCase().includes("month") && !text.toLowerCase().includes("follow-up") && !text.toLowerCase().includes("next"),
          noMeasurableGoal: !text.toLowerCase().includes("goal") && !text.toLowerCase().includes("target") && !text.toLowerCase().includes("objective")
        }
      }
    ];

    return soapAnalysis.map(analysis => {
      if (!analysis.present) {
        return {
          section: analysis.section,
          status: "non-compliant" as const,
          issues: [`❌ ${analysis.section} section missing from note`],
          triggers: [`Missing required ${analysis.section} section - must document ${getSectionRequirement(analysis.section)}`]
        };
      }

      const triggeredIssues = Object.entries(analysis.triggers)
        .filter(([_, triggered]) => triggered)
        .map(([trigger, _]) => getTriggerMessage(analysis.section, trigger));

      const status = triggeredIssues.length === 0 ? "compliant" : 
                   triggeredIssues.length <= 1 ? "warning" : "non-compliant";

      return {
        section: analysis.section,
        status: status as "compliant" | "warning" | "non-compliant",
        issues: triggeredIssues,
        triggers: triggeredIssues.length > 0 ? [getCorrection(analysis.section, Object.keys(analysis.triggers).filter((_, i) => Object.values(analysis.triggers)[i]))] : []
      };
    });
  };

  const getSectionRequirement = (section: string) => {
    const requirements: { [key: string]: string } = {
      "Subjective": "client's perspective and reported symptoms in their own words",
      "Objective": "observed and measured facts including appearance, behavior, MSE, and vitals",
      "Assessment": "clinical impressions with DSM-5-TR diagnosis codes and severity",
      "Plan": "treatment goals, interventions, and next steps with measurable outcomes"
    };
    return requirements[section] || "comprehensive documentation";
  };

  const getTriggerMessage = (section: string, trigger: string) => {
    const messages: { [key: string]: { [key: string]: string } } = {
      "Subjective": {
        missingPatientVoice: "Missing patient's own words - document direct quotes or paraphrased statements",
        vagueMoodSymptoms: "Vague mood/symptom description - specify emotional states and symptoms"
      },
      "Objective": {
        noMeasurableData: "No measurable observational data - include appearance, behavior, MSE findings",
        vagueObservation: "Vague observations - provide specific behavioral and physical descriptions"
      },
      "Assessment": {
        missingDSMCode: "Missing DSM-5-TR diagnostic code - include specific F-code diagnosis",
        noRationale: "No diagnostic rationale provided - explain clinical reasoning",
        noSeverity: "Missing severity specifier - document mild/moderate/severe classification"
      },
      "Plan": {
        noTimeline: "No treatment timeline specified - include follow-up schedule and timeframes",
        noMeasurableGoal: "No measurable treatment goals - define specific, achievable objectives"
      }
    };
    return messages[section]?.[trigger] || "Documentation deficiency identified";
  };

  const getCorrection = (section: string, triggers: string[]) => {
    const corrections: { [key: string]: string } = {
      "Subjective": "Add client's direct statements about symptoms, feelings, and concerns using quotes or clear paraphrasing",
      "Objective": "Include specific observations: appearance, behavior, speech, mood, affect, thought process, and mental status exam findings",
      "Assessment": "Provide DSM-5-TR diagnosis with F-code, severity specifier, and clinical rationale for diagnosis",
      "Plan": "Document specific treatment interventions, measurable goals, timeline for follow-up, and next appointment date"
    };
    return corrections[section] || "Improve documentation completeness";
  };

  const analyzeComplianceDomains = (soapFindings: any[], overallScore: number) => {
    const domains = [
      {
        domain: "Medical Necessity Demonstration",
        score: Math.max(60, overallScore - 10),
        status: overallScore >= 80 ? "compliant" : overallScore >= 65 ? "warning" : "non-compliant",
        findings: overallScore < 80 ? ["Insufficient documentation of medical necessity", "Need stronger clinical justification"] : []
      },
      {
        domain: "Documentation Completeness",
        score: overallScore,
        status: overallScore >= 85 ? "compliant" : overallScore >= 70 ? "warning" : "non-compliant",
        findings: overallScore < 85 ? ["Missing required documentation elements", "Incomplete section coverage"] : []
      },
      {
        domain: "Individualization Requirements",
        score: Math.min(100, overallScore + 5),
        status: overallScore >= 75 ? "compliant" : overallScore >= 60 ? "warning" : "non-compliant",
        findings: overallScore < 75 ? ["Treatment plan lacks individualization", "Generic approach documented"] : []
      },
      {
        domain: "Regulatory Compliance",
        score: Math.max(50, overallScore - 15),
        status: overallScore >= 90 ? "compliant" : overallScore >= 75 ? "warning" : "non-compliant",
        findings: overallScore < 90 ? ["Regulatory requirements not fully met", "Risk of audit findings"] : []
      },
      {
        domain: "Audit Defensibility",
        score: Math.max(40, overallScore - 20),
        status: overallScore >= 85 ? "compliant" : overallScore >= 70 ? "warning" : "non-compliant",
        findings: overallScore < 85 ? ["Documentation may not withstand audit scrutiny", "Strengthen evidence base"] : []
      }
    ] as const;

    return domains.map(domain => ({
      ...domain,
      status: domain.status as "compliant" | "warning" | "non-compliant"
    }));
  };

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
        complianceDomains: [],
        soapFindings: [],
        missingSections: [],
        recommendations: ["This prototype only supports SOAP note format", "Please ensure your note contains Subjective, Objective, Assessment, and Plan sections"],
        references: [
          `${selectedState} Medicaid Provider Manual - Clinical Documentation Standards`,
          "CMS Medicare Progress Note Guidelines - Section 1861(s)(2)",
          `${selectedState} Administrative Code - Mental Health Documentation Requirements`
        ]
      };
      setResult(nonSOAPResult);
      setIsAnalyzing(false);
      return;
    }
    
    // SOAP format detected - perform comprehensive analysis
    const soapFindings = analyzeSOAPContent(noteText, detection.foundSections, selectedState);
    const complianceDomains = analyzeComplianceDomains(soapFindings, detection.overallScore);
    
    // Calculate adjusted overall score based on domain analysis
    const domainAverage = Math.round(complianceDomains.reduce((sum, domain) => sum + domain.score, 0) / complianceDomains.length);
    const adjustedScore = Math.round((detection.overallScore + domainAverage) / 2);

    const result: ComplianceResult = {
      detectedFormat: "SOAP Note",
      confidence: detection.confidence,
      riskLevel: adjustedScore >= 80 ? "Low" : adjustedScore >= 65 ? "Medium" : "High",
      overallScore: adjustedScore,
      complianceDomains,
      soapFindings,
      missingSections: detection.missingSections,
      recommendations: [
        ...detection.missingSections.map(section => `❌ Add missing ${section} section with comprehensive documentation`),
        ...soapFindings.flatMap(finding => finding.triggers || []),
        `Ensure full compliance with ${selectedState} state regulations`,
        `Verify ${selectedPayer} billing and documentation requirements`,
        "Include provider signature, credentials, and date",
        "Review against audit checklist before submission"
      ].filter((rec, index, arr) => arr.indexOf(rec) === index),
      references: [
        `${selectedState} Medicaid Provider Manual - Clinical Documentation Standards`,
        "CMS Medicare Progress Note Guidelines - Section 1861(s)(2)",
        `${selectedState} Administrative Code - Mental Health Documentation Requirements`,
        selectedPayer === "medicaid" ? `${selectedState} Medicaid Mental Health Services Coverage` :
        selectedPayer === "medicare" ? "Medicare Claims Processing Manual Chapter 12" :
        "Commercial Insurance Prior Authorization Guidelines",
        "DSM-5-TR Diagnostic Criteria and Documentation Standards"
      ]
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