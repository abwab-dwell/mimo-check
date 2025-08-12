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
  findings: {
    section: string;
    status: "compliant" | "warning" | "non-compliant";
    issues: string[];
  }[];
  missingSections: string[];
  recommendations: string[];
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

  const auditReadiness = getAuditReadiness(result.overallScore);

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="shadow-elevated border-l-4 border-l-primary">
        <CardHeader className="bg-gradient-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Executive Summary</CardTitle>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Detected Format</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{result.detectedFormat}</span>
                <Badge variant="outline">{Math.round(result.confidence * 100)}% confidence</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Risk Level</span>
              </div>
              <Badge variant={getRiskBadgeVariant(result.riskLevel)} className="text-sm">
                {result.riskLevel} Risk
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Audit Readiness</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={auditReadiness.variant}>{auditReadiness.text}</Badge>
                  <span className="text-sm font-medium">{result.overallScore}%</span>
                </div>
                <Progress value={result.overallScore} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SOAP Section Analysis */}
      <Card className="shadow-compliance">
        <CardHeader>
          <CardTitle>SOAP Section Analysis</CardTitle>
          <CardDescription>
            Section-by-section compliance evaluation for {state} regulations and {payer} requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.findings.map((finding, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(finding.status)}
                    <h4 className="font-semibold">{finding.section}</h4>
                  </div>
                  <Badge 
                    variant={finding.status === "compliant" ? "success" : finding.status === "warning" ? "warning" : "destructive"}
                  >
                    {finding.status === "compliant" ? "Compliant" : 
                     finding.status === "warning" ? "Warning" : "Non-Compliant"}
                  </Badge>
                </div>
                
                {finding.issues.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Issues Found:</span>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {finding.issues.map((issue, issueIndex) => (
                        <li key={issueIndex} className="text-muted-foreground">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Missing Sections */}
      {result.missingSections.length > 0 && (
        <Card className="shadow-compliance border-l-4 border-l-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Missing Required Sections
            </CardTitle>
            <CardDescription>
              The following sections are required for full compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.missingSections.map((section, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">{section}</span>
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
    </div>
  );
};