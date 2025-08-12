import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, Download, AlertCircle, TrendingUp, FileCheck, Shield } from "lucide-react";

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
  sectionFindings: {
    section: string;
    status: "compliant" | "warning" | "non-compliant";
    issues: string[];
    triggers?: string[];
  }[];
  missingSections: string[];
  recommendations: string[];
  references: string[];
}

interface ComplianceReportProps {
  result: ComplianceResult;
  state: string;
  payer: string;
}

export const ComplianceReport = ({ result, state, payer }: ComplianceReportProps) => {
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

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "Low":
        return "success";
      case "Medium":
        return "warning";
      case "High":
        return "destructive";
      default:
        return "default";
    }
  };

  const getAuditReadiness = (score: number) => {
    if (score >= 90) return { text: "Audit Ready", variant: "success" as const };
    if (score >= 75) return { text: "Minor Issues", variant: "warning" as const };
    return { text: "Needs Attention", variant: "destructive" as const };
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "compliant":
        return "✅";
      case "warning":
        return "⚠️";
      case "non-compliant":
        return "❌";
      default:
        return "❌";
    }
  };

  const getRiskLevelEmoji = (risk: string) => {
    switch (risk) {
      case "Low":
        return "✅";
      case "Medium":
        return "⚠️";
      case "High":
        return "❌";
      default:
        return "❌";
    }
  };

  const getPrimaryConcerns = () => {
    const concerns: string[] = [];
    
    // Check for missing sections
    if (result.missingSections.length > 0) {
      concerns.push(`Missing ${result.missingSections.length} required SOAP section(s)`);
    }
    
    // Check for non-compliant domains
    const criticalDomains = result.complianceDomains.filter(d => d.status === "non-compliant");
    if (criticalDomains.length > 0) {
      concerns.push(`${criticalDomains.length} domain(s) non-compliant`);
    }
    
    // Check for section issues
    const sectionIssues = result.sectionFindings.filter(f => f.status !== "compliant");
    if (sectionIssues.length > 0) {
      concerns.push(`${sectionIssues.length} section(s) with deficiencies`);
    }
    
    return concerns.slice(0, 3); // Top 3 concerns
  };

  const auditReadiness = getAuditReadiness(result.overallScore);
  const primaryConcerns = getPrimaryConcerns();

  return (
    <div className="space-y-6">
      {/* Compliance Executive Summary */}
      <Card className="shadow-elevated border-l-4 border-l-primary">
        <CardHeader className="bg-gradient-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">🏥 COMPLIANCE EXECUTIVE SUMMARY</CardTitle>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Overall Risk Level:</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getRiskLevelEmoji(result.riskLevel)}</span>
                  <span className="text-lg font-bold">{result.riskLevel.toUpperCase()}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Primary Concerns:</span>
                {primaryConcerns.length > 0 ? (
                  <ul className="space-y-1">
                    {primaryConcerns.map((concern, index) => (
                      <li key={index} className="text-sm text-foreground">• {concern}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm text-success">No major concerns identified</span>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Audit Readiness:</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getStatusEmoji(auditReadiness.text === "Audit Ready" ? "compliant" : 
                                                                auditReadiness.text === "Minor Issues" ? "warning" : "non-compliant")}</span>
                  <span className="text-lg font-bold">{auditReadiness.text.toUpperCase()}</span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Compliance Score</span>
                    <span className="font-medium">{result.overallScore}%</span>
                  </div>
                  <Progress value={result.overallScore} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 📊 DETAILED COMPLIANCE MATRIX */}
      <Card className="shadow-compliance">
        <CardHeader>
          <CardTitle className="text-xl">📊 DETAILED COMPLIANCE MATRIX</CardTitle>
          <CardDescription>
            Comprehensive evaluation across 5 core compliance areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Domain</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Critical Issues</th>
                  <th className="text-left p-3 font-semibold">Required Actions</th>
                  <th className="text-left p-3 font-semibold">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {result.complianceDomains.map((domain, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-medium">{domain.domain}</div>
                      <div className="text-sm text-muted-foreground">{domain.score}%</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getStatusEmoji(domain.status)}</span>
                        <Badge variant={domain.status === "compliant" ? "success" : domain.status === "warning" ? "warning" : "destructive"}>
                          {domain.status === "compliant" ? "Compliant" : 
                           domain.status === "warning" ? "Warning" : "Non-Compliant"}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      {domain.findings.length > 0 ? (
                        <ul className="text-sm space-y-1">
                          {domain.findings.slice(0, 2).map((finding, idx) => (
                            <li key={idx}>• {finding}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-muted-foreground">None identified</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {domain.status !== "compliant" ? 
                          `Improve ${domain.domain.toLowerCase()} documentation` : 
                          "Maintain current standards"
                        }
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span>{domain.score >= 80 ? "✅" : domain.score >= 65 ? "⚠️" : "❌"}</span>
                        <span className="text-sm font-medium">
                          {domain.score >= 80 ? "LOW" : domain.score >= 65 ? "MED" : "HIGH"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* SECTION ANALYSIS */}
      <Card className="shadow-compliance">
        <CardHeader>
          <CardTitle className="text-xl">📋 SECTION ANALYSIS</CardTitle>
          <CardDescription>
            Section-by-section compliance evaluation with deficiency triggers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {result.sectionFindings.map((finding, index) => (
              <div key={index} className="space-y-3">
                <div className="border-l-4 border-l-primary pl-4">
                  <h3 className="text-lg font-semibold">
                    ### {finding.section} ({finding.section.charAt(0)})
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl">{getStatusEmoji(finding.status)}</span>
                    <span className="font-medium">
                      {finding.status === "compliant" ? "COMPLIANT" : 
                       finding.status === "warning" ? "WARNING" : "NON-COMPLIANT"}
                    </span>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-sm text-muted-foreground">
                      {finding.issues.length === 0 ? "All requirements met" : `${finding.issues.length} issue(s) identified`}
                    </span>
                  </div>
                </div>
                
                {finding.issues.length > 0 && (
                  <div className="ml-6 space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <strong>Findings:</strong>
                    </div>
                    <ul className="space-y-1">
                      {finding.issues.map((issue, issueIndex) => (
                        <li key={issueIndex} className="text-sm">• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {finding.triggers && finding.triggers.length > 0 && (
                  <div className="ml-6 bg-warning/10 border-l-4 border-l-warning p-3 rounded-r">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-warning">⚠️</span>
                      <span className="text-sm font-medium">Example correction:</span>
                    </div>
                    {finding.triggers.map((trigger, triggerIndex) => (
                      <p key={triggerIndex} className="text-sm text-foreground">{trigger}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Missing/Unknown Sections */}
      {result.missingSections.length > 0 && (
        <Card className="shadow-compliance border-l-4 border-l-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              ❌ Missing/Unknown Sections
            </CardTitle>
            <CardDescription>
              Required sections not found in the clinical note
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.missingSections.map((section, index) => (
                <div key={index} className="border-l-4 border-l-destructive pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">❌</span>
                    <span className="font-semibold">{section}:</span>
                    <span className="text-muted-foreground">Missing required element</span>
                  </div>
                  <div className="bg-destructive/10 p-3 rounded">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-sm">Correction:</span>
                      <span className="text-sm">
                        Add comprehensive {section.toLowerCase()} section with all required documentation elements per regulatory guidelines.
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="shadow-compliance border-l-4 border-l-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-accent" />
            Recommended Actions
          </CardTitle>
          <CardDescription>
            Priority actions to improve compliance and reduce audit risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </div>
                <span className="text-sm flex-1">{recommendation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* References */}
      <Card className="shadow-compliance border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            📚 References
          </CardTitle>
          <CardDescription>
            Applicable guidelines and standards for this analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.references.map((reference, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-muted-foreground">•</span>
                <span className="text-sm font-medium">{reference}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};