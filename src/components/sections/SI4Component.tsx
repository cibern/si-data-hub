import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Shield, Droplets } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectData {
  projectName: string;
  usBuilding: string;
  totalSurface: string;
  evacuationHeight: string;
  floors: string;
  maxOccupancy: string;
  buildingLocation: string;
}

interface SiData {
  si1: any;
  si2: any;
  si3: any;
  si4: {
    detectionSystem: string;
    extinguishingSystem: string;
    waterSupply: string;
  };
  si5: any;
  si6: any;
}

interface SI4ComponentProps {
  projectData: ProjectData;
  siData: SiData;
  onSiDataChange: (data: SiData) => void;
  onSiResultChange: (result: any) => void;
}

const SI4Component = ({ projectData, siData, onSiDataChange, onSiResultChange }: SI4ComponentProps) => {
  const { toast } = useToast();
  
  const [results, setResults] = useState({
    requiredDetection: "",
    requiredSuppression: "",
    sprinklerRequired: false,
    detectionCompliance: false,
    suppressionCompliance: false,
    recommendations: [] as string[],
  });

  const buildingUses = [
    { value: "residential", label: "Residencial" },
    { value: "office", label: "Administratiu" },
    { value: "commercial", label: "Comercial" },
    { value: "assembly", label: "Pública concurrència" },
    { value: "educational", label: "Docent" },
    { value: "healthcare", label: "Sanitari" },
    { value: "industrial", label: "Industrial" },
  ];

  const riskLevels = [
    { value: "low", label: "Risc baix" },
    { value: "medium", label: "Risc mitjà" },
    { value: "high", label: "Risc alt" },
  ];

  const calculateFireProtection = () => {
    const heightNum = parseFloat(formData.buildingHeight);
    const areaNum = parseFloat(formData.sectorArea);

    if (!heightNum || !areaNum || !formData.buildingUse || !formData.riskLevel) {
      toast({
        title: "Error",
        description: "Si us plau, omple tots els camps necessaris",
        variant: "destructive",
      });
      return;
    }

    let requiredDetection = "Manual";
    let requiredSuppression = "Extintors";
    let sprinklerRequired = false;
    const recommendations: string[] = [];

    // Detecció segons ús i altura
    if (heightNum > 28 || ["healthcare", "assembly"].includes(formData.buildingUse)) {
      requiredDetection = "Automàtica";
    } else if (heightNum > 15 || areaNum > 1000) {
      requiredDetection = "Semiautomàtica";
    }

    // Sistemes d'extinció
    if (heightNum > 50 || areaNum > 2500) {
      requiredSuppression = "Sprinklers";
      sprinklerRequired = true;
    } else if (heightNum > 28 || ["commercial", "assembly"].includes(formData.buildingUse)) {
      requiredSuppression = "BIE";
    }

    // Verificació sprinklers per ús específic
    if (["healthcare", "assembly"].includes(formData.buildingUse) && areaNum > 500) {
      sprinklerRequired = true;
      requiredSuppression = "Sprinklers";
    }

    const detectionCompliance = 
      (requiredDetection === "Manual" && formData.detectionSystem !== "") ||
      (requiredDetection === "Semiautomàtica" && ["semi", "automatic"].includes(formData.detectionSystem)) ||
      (requiredDetection === "Automàtica" && formData.detectionSystem === "automatic");

    const suppressionCompliance = 
      (requiredSuppression === "Extintors" && formData.suppressionSystem !== "") ||
      (requiredSuppression === "BIE" && ["bie", "sprinklers"].includes(formData.suppressionSystem)) ||
      (requiredSuppression === "Sprinklers" && formData.suppressionSystem === "sprinklers");

    if (!detectionCompliance) {
      recommendations.push(`Instal·lar sistema de detecció: ${requiredDetection}`);
    }

    if (!suppressionCompliance) {
      recommendations.push(`Instal·lar sistema d'extinció: ${requiredSuppression}`);
    }

    setResults({
      requiredDetection,
      requiredSuppression,
      sprinklerRequired,
      detectionCompliance,
      suppressionCompliance,
      recommendations,
    });

    const overallCompliance = detectionCompliance && suppressionCompliance;

    toast({
      title: overallCompliance ? "Compliment verificat" : "Incompliment detectat",
      description: overallCompliance 
        ? "Els sistemes de protecció compleixen SI 4" 
        : "Revisa les recomanacions per complir",
      variant: overallCompliance ? "default" : "destructive",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Sistemes de detecció i extinció
            </CardTitle>
            <CardDescription>
              Paràmetres per verificar sistemes de protecció contra incendis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buildingHeight">Alçada de l'edifici (m)</Label>
                <Input
                  id="buildingHeight"
                  type="number"
                  value={formData.buildingHeight}
                  onChange={(e) => handleInputChange("buildingHeight", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sectorArea">Àrea del sector (m²)</Label>
                <Input
                  id="sectorArea"
                  type="number"
                  value={formData.sectorArea}
                  onChange={(e) => handleInputChange("sectorArea", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buildingUse">Ús de l'edifici</Label>
                <Select value={formData.buildingUse} onValueChange={(value) => handleInputChange("buildingUse", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona l'ús" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildingUses.map(use => (
                      <SelectItem key={use.value} value={use.value}>
                        {use.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="riskLevel">Nivell de risc</Label>
                <Select value={formData.riskLevel} onValueChange={(value) => handleInputChange("riskLevel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el risc" />
                  </SelectTrigger>
                  <SelectContent>
                    {riskLevels.map(risk => (
                      <SelectItem key={risk.value} value={risk.value}>
                        {risk.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="detectionSystem">Sistema de detecció actual</Label>
                <Select value={formData.detectionSystem} onValueChange={(value) => handleInputChange("detectionSystem", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sistema instal·lat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="semi">Semiautomàtic</SelectItem>
                    <SelectItem value="automatic">Automàtic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suppressionSystem">Sistema d'extinció actual</Label>
                <Select value={formData.suppressionSystem} onValueChange={(value) => handleInputChange("suppressionSystem", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sistema instal·lat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="extinguishers">Extintors</SelectItem>
                    <SelectItem value="bie">BIE</SelectItem>
                    <SelectItem value="sprinklers">Sprinklers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={calculateFireProtection} 
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              Verificar sistemes SI 4
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.detectionCompliance && results.suppressionCompliance ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              Resultats sistemes de protecció
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.requiredDetection && (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Detecció requerida:</span>
                    <Badge variant="secondary">{results.requiredDetection}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Extinció requerida:</span>
                    <Badge variant="outline">{results.requiredSuppression}</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Compliment detecció:</span>
                    <Badge variant={results.detectionCompliance ? "default" : "destructive"}>
                      {results.detectionCompliance ? "COMPLEIX" : "NO COMPLEIX"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Compliment extinció:</span>
                    <Badge variant={results.suppressionCompliance ? "default" : "destructive"}>
                      {results.suppressionCompliance ? "COMPLEIX" : "NO COMPLEIX"}
                    </Badge>
                  </div>
                </div>

                {results.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Recomanacions:</h4>
                    <ul className="space-y-1">
                      {results.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm bg-accent p-2 rounded flex items-start gap-2">
                          <Droplets className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SI4Component;