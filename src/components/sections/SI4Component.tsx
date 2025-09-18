import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2, Calculator, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SI4Component = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    usBuilding: "",
    totalArea: "",
    buildingHeight: "",
    riskLevel: "",
    hasSprinklers: false,
    hasDetection: false,
    hasAlarm: false,
    hasEmergencyLighting: false,
  });
  
  const [results, setResults] = useState({
    requiredSystems: [] as string[],
    extinguisherType: "",
    hydrantCoverage: 0,
    complianceLevel: 0,
    recommendations: [] as string[],
  });

  const usosBuilding = [
    { value: "residential", label: "Residencial", risk: "baixo" },
    { value: "office", label: "Oficines", risk: "mitjà" },
    { value: "commercial", label: "Comercial", risk: "mitjà" },
    { value: "industrial", label: "Industrial", risk: "alt" },
    { value: "educational", label: "Educatiu", risk: "mitjà" },
    { value: "healthcare", label: "Sanitari", risk: "alt" },
    { value: "hotel", label: "Hoteler", risk: "mitjà" },
    { value: "parking", label: "Aparcament", risk: "baixo" },
  ];

  const riskLevels = [
    { value: "baixo", label: "Risc baix" },
    { value: "mitjà", label: "Risc mitjà" },
    { value: "alt", label: "Risc alt" },
  ];

  const calculateFireProtection = () => {
    const totalAreaNum = parseFloat(formData.totalArea);
    const heightNum = parseFloat(formData.buildingHeight);

    if (!totalAreaNum || !heightNum || !formData.usBuilding || !formData.riskLevel) {
      toast({
        title: "Error",
        description: "Si us plau, omple tots els camps necessaris",
        variant: "destructive",
      });
      return;
    }

    const requiredSystems: string[] = [];
    const recommendations: string[] = [];
    let extinguisherType = "21A-113B";
    let hydrantCoverage = 0;

    // Sistemes obligatoris segons ús i dimensions
    requiredSystems.push("Extintors portàtils");
    
    if (totalAreaNum > 500 || heightNum > 15) {
      requiredSystems.push("Boques d'incendi equipades (BIE)");
      hydrantCoverage = Math.ceil(totalAreaNum / 400); // 1 BIE per cada 400m²
    }

    if (heightNum > 28) {
      requiredSystems.push("Columna seca");
    }

    if (["healthcare", "hotel"].includes(formData.usBuilding) || 
        (totalAreaNum > 1000 && formData.riskLevel === "alt")) {
      requiredSystems.push("Sistema de detecció i alarma");
    }

    if (formData.riskLevel === "alt" || totalAreaNum > 2000) {
      requiredSystems.push("Extinció automàtica (sprinklers)");
    }

    if (heightNum > 15 || ["educational", "healthcare", "hotel"].includes(formData.usBuilding)) {
      requiredSystems.push("Il·luminació d'emergència");
      requiredSystems.push("Senyalització de sortides");
    }

    if (totalAreaNum > 1500) {
      requiredSystems.push("Sistema d'evacuació per megafonia");
    }

    // Control d'evacuació de fums
    if (["commercial", "industrial"].includes(formData.usBuilding) && totalAreaNum > 1000) {
      requiredSystems.push("Control d'evacuació de fums");
    }

    // Verificar sistemes instal·lats
    let complianceLevel = 0;
    const totalRequired = requiredSystems.length;

    if (formData.hasDetection && requiredSystems.includes("Sistema de detecció i alarma")) {
      complianceLevel++;
    } else if (requiredSystems.includes("Sistema de detecció i alarma")) {
      recommendations.push("Instal·lar sistema de detecció i alarma");
    }

    if (formData.hasSprinklers && requiredSystems.includes("Extinció automàtica (sprinklers)")) {
      complianceLevel++;
    } else if (requiredSystems.includes("Extinció automàtica (sprinklers)")) {
      recommendations.push("Instal·lar sistema d'extinció automàtica");
    }

    if (formData.hasEmergencyLighting && requiredSystems.includes("Il·luminació d'emergència")) {
      complianceLevel++;
    } else if (requiredSystems.includes("Il·luminació d'emergència")) {
      recommendations.push("Instal·lar il·luminació d'emergència");
    }

    if (formData.hasAlarm && requiredSystems.includes("Sistema d'evacuació per megafonia")) {
      complianceLevel++;
    } else if (requiredSystems.includes("Sistema d'evacuació per megafonia")) {
      recommendations.push("Instal·lar sistema de megafonia");
    }

    // Recomanacions generals
    if (formData.riskLevel === "alt" && !formData.hasSprinklers) {
      recommendations.push("Es recomana encaridament l'extinció automàtica per risc alt");
    }

    if (heightNum > 50) {
      recommendations.push("Considerar ascensor d'emergència per edificis alts");
      extinguisherType = "34A-144B";
    }

    // Extintors segons ús
    if (["industrial", "parking"].includes(formData.usBuilding)) {
      extinguisherType = "21A-144B";
    }

    complianceLevel = Math.round((complianceLevel / Math.max(totalRequired, 4)) * 100);

    setResults({
      requiredSystems,
      extinguisherType,
      hydrantCoverage,
      complianceLevel,
      recommendations,
    });

    toast({
      title: complianceLevel >= 80 ? "Bon compliment" : "Compliment insuficient",
      description: `Nivell de compliment: ${complianceLevel}%`,
      variant: complianceLevel >= 80 ? "default" : "destructive",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulari d'entrada */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              Sistemes de protecció contra incendis
            </CardTitle>
            <CardDescription>
              Defineix les característiques per determinar els sistemes necessaris
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usBuilding">Ús de l'edifici</Label>
              <Select value={formData.usBuilding} onValueChange={(value) => handleInputChange("usBuilding", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona l'ús" />
                </SelectTrigger>
                <SelectContent>
                  {usosBuilding.map(us => (
                    <SelectItem key={us.value} value={us.value}>
                      {us.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalArea">Superfície total (m²)</Label>
                <Input
                  id="totalArea"
                  type="number"
                  value={formData.totalArea}
                  onChange={(e) => handleInputChange("totalArea", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buildingHeight">Alçada edifici (m)</Label>
                <Input
                  id="buildingHeight"
                  type="number"
                  value={formData.buildingHeight}
                  onChange={(e) => handleInputChange("buildingHeight", e.target.value)}
                  placeholder="0"
                />
              </div>
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

            <div className="space-y-3">
              <Label>Sistemes ja instal·lats:</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sprinklers"
                    checked={formData.hasSprinklers}
                    onCheckedChange={(checked) => handleCheckboxChange("hasSprinklers", checked as boolean)}
                  />
                  <Label htmlFor="sprinklers" className="text-sm">Sprinklers automàtics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="detection"
                    checked={formData.hasDetection}
                    onCheckedChange={(checked) => handleCheckboxChange("hasDetection", checked as boolean)}
                  />
                  <Label htmlFor="detection" className="text-sm">Sistema de detecció</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="alarm"
                    checked={formData.hasAlarm}
                    onCheckedChange={(checked) => handleCheckboxChange("hasAlarm", checked as boolean)}
                  />
                  <Label htmlFor="alarm" className="text-sm">Sistema d'alarma/megafonia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="emergencyLighting"
                    checked={formData.hasEmergencyLighting}
                    onCheckedChange={(checked) => handleCheckboxChange("hasEmergencyLighting", checked as boolean)}
                  />
                  <Label htmlFor="emergencyLighting" className="text-sm">Il·luminació d'emergència</Label>
                </div>
              </div>
            </div>

            <Button 
              onClick={calculateFireProtection} 
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              Analitzar sistemes SI 4
            </Button>
          </CardContent>
        </Card>

        {/* Resultats */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.complianceLevel >= 80 ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              Sistemes requerits SI 4
            </CardTitle>
            <CardDescription>
              Anàlisi dels sistemes de protecció necessaris
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.requiredSystems.length > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Nivell de compliment:</span>
                    <Badge variant={results.complianceLevel >= 80 ? "default" : "destructive"}>
                      {results.complianceLevel}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Tipus d'extintor:</span>
                    <Badge variant="outline">{results.extinguisherType}</Badge>
                  </div>

                  {results.hydrantCoverage > 0 && (
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">BIE necessàries:</span>
                      <Badge variant="outline">{results.hydrantCoverage}</Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Sistemes requerits:</h4>
                  <ul className="space-y-1">
                    {results.requiredSystems.map((system, index) => (
                      <li key={index} className="text-sm bg-secondary p-2 rounded flex items-center gap-2">
                        <Shield className="h-4 w-4 text-success flex-shrink-0" />
                        {system}
                      </li>
                    ))}
                  </ul>
                </div>

                {results.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Recomanacions:</h4>
                    <ul className="space-y-1">
                      {results.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm bg-accent p-2 rounded flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />
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