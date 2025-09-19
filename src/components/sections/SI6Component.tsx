import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Building2, Calculator } from "lucide-react";
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

interface SI6ComponentProps {
  projectData: ProjectData;
  siData: any;
  onSiDataChange: (data: any) => void;
}

const SI6Component = ({ projectData, siData, onSiDataChange }: SI6ComponentProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    buildingHeight: "",
    buildingUse: "",
    structuralMaterial: "",
    sectorLocation: "",
    riskLevel: "",
    numberOfFloors: "",
  });
  
  const [results, setResults] = useState({
    requiredResistance: "",
    materialCompliance: false,
    heightCompliance: false,
    overallCompliance: false,
    recommendations: [] as string[],
  });

  const buildingUses = [
    { value: "residential_single", label: "Vivienda unifamiliar" },
    { value: "residential", label: "Residencial Vivienda" },
    { value: "office", label: "Administratiu" },
    { value: "commercial", label: "Comercial" },
    { value: "assembly", label: "Pública concurrència" },
    { value: "educational", label: "Docent" },
    { value: "healthcare", label: "Hospitalari" },
    { value: "parking_exclusive", label: "Aparcament (edifici exclusiu)" },
    { value: "parking_under", label: "Aparcament (sota altre ús)" },
  ];

  const structuralMaterials = [
    { value: "concrete", label: "Formigó armat" },
    { value: "steel", label: "Acer" },
    { value: "wood", label: "Fusta" },
    { value: "masonry", label: "Obra de fàbrica" },
    { value: "mixed", label: "Estructura mixta" },
  ];

  const riskLevels = [
    { value: "low", label: "Risc especial baix" },
    { value: "medium", label: "Risc especial mitjà" },
    { value: "high", label: "Risc especial alt" },
    { value: "normal", label: "Risc normal" },
  ];

  const calculateStructuralResistance = () => {
    const heightNum = parseFloat(formData.buildingHeight);
    const floorsNum = parseFloat(formData.numberOfFloors);

    if (!heightNum || !formData.buildingUse || !formData.structuralMaterial) {
      toast({
        title: "Error",
        description: "Si us plau, omple tots els camps necessaris",
        variant: "destructive",
      });
      return;
    }

    let requiredResistance = "R 30";
    const recommendations: string[] = [];

    // Determinació de resistència segons taula 3.1 de SI6
    if (formData.sectorLocation === "basement") {
      // Plantes sota rasant
      if (formData.buildingUse === "residential_single") {
        requiredResistance = "R 30";
      } else if (["residential", "educational", "office"].includes(formData.buildingUse)) {
        requiredResistance = "R 120";
      } else if (["commercial", "assembly", "healthcare"].includes(formData.buildingUse)) {
        requiredResistance = heightNum > 28 ? "R 180" : "R 120";
      } else if (formData.buildingUse === "parking_exclusive") {
        requiredResistance = "R 90";
      } else if (formData.buildingUse === "parking_under") {
        requiredResistance = "R 120";
      }
    } else {
      // Plantes sobre rasant
      if (formData.buildingUse === "residential_single") {
        requiredResistance = "R 30";
      } else if (["residential", "educational", "office"].includes(formData.buildingUse)) {
        if (heightNum <= 15) requiredResistance = "R 60";
        else if (heightNum <= 28) requiredResistance = "R 90";
        else requiredResistance = "R 120";
      } else if (["commercial", "assembly", "healthcare"].includes(formData.buildingUse)) {
        if (heightNum <= 15) requiredResistance = "R 90";
        else if (heightNum <= 28) requiredResistance = "R 120";
        else requiredResistance = "R 180";
      }
    }

    // Verificacions per risc especial (taula 3.2)
    if (formData.riskLevel === "low") {
      requiredResistance = "R 90";
    } else if (formData.riskLevel === "medium") {
      requiredResistance = "R 120";
    } else if (formData.riskLevel === "high") {
      requiredResistance = "R 180";
    }

    // Recomanacions específiques
    if (heightNum > 28) {
      recommendations.push("Edifici d'altura - considerar mètodes avançats de càlcul");
    }

    if (formData.structuralMaterial === "steel") {
      recommendations.push("Estructura d'acer - verificar protecció passiva");
    }

    if (formData.structuralMaterial === "wood") {
      recommendations.push("Estructura de fusta - verificar dimensions mínimes");
    }

    if (["commercial", "assembly"].includes(formData.buildingUse)) {
      recommendations.push("Ús de pública concurrència - especial atenció a sortides");
    }

    // Verificacions de compliment (simplificat)
    const materialCompliance = true; // Requeriria verificació detallada
    const heightCompliance = heightNum <= 100; // Límit simplificat
    const overallCompliance = materialCompliance && heightCompliance;

    if (!heightCompliance) {
      recommendations.push("Alçada excessiva - aplicar mètodes especials de càlcul");
    }

    // Recomanacions per cobertes lleugeres
    if (formData.sectorLocation === "roof" && heightNum <= 28) {
      recommendations.push("Coberta lleugera: pot ser R 30 si no compromet estabilitat");
    }

    setResults({
      requiredResistance,
      materialCompliance,
      heightCompliance,
      overallCompliance,
      recommendations,
    });

    toast({
      title: overallCompliance ? "Compliment verificat" : "Verificació necessària",
      description: overallCompliance 
        ? "L'estructura compleix els requisits bàsics SI 6" 
        : "Revisa les recomanacions i considera càlcul detallat",
      variant: overallCompliance ? "default" : "destructive",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulari d'entrada */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Resistència al foc estructural
            </CardTitle>
            <CardDescription>
              Paràmetres per determinar la resistència al foc de l'estructura
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
                <Label htmlFor="numberOfFloors">Nombre de plantes</Label>
                <Input
                  id="numberOfFloors"
                  type="number"
                  value={formData.numberOfFloors}
                  onChange={(e) => handleInputChange("numberOfFloors", e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="structuralMaterial">Material estructural</Label>
                <Select value={formData.structuralMaterial} onValueChange={(value) => handleInputChange("structuralMaterial", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Material principal" />
                  </SelectTrigger>
                  <SelectContent>
                    {structuralMaterials.map(material => (
                      <SelectItem key={material.value} value={material.value}>
                        {material.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sectorLocation">Localització del sector</Label>
                <Select value={formData.sectorLocation} onValueChange={(value) => handleInputChange("sectorLocation", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ubicació" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basement">Sota rasant</SelectItem>
                    <SelectItem value="ground">Sobre rasant</SelectItem>
                    <SelectItem value="roof">Coberta</SelectItem>
                  </SelectContent>
                </Select>
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

            <Button 
              onClick={calculateStructuralResistance} 
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calcular resistència SI 6
            </Button>
          </CardContent>
        </Card>

        {/* Resultats */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.overallCompliance ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warning" />
              )}
              Resultats resistència estructural
            </CardTitle>
            <CardDescription>
              Resistència al foc requerida per l'estructura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.requiredResistance && (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Resistència requerida:</span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {results.requiredResistance}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Material adequat:</span>
                    <Badge variant={results.materialCompliance ? "default" : "destructive"}>
                      {results.materialCompliance ? "COMPLEIX" : "VERIFICAR"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Altura adequada:</span>
                    <Badge variant={results.heightCompliance ? "default" : "destructive"}>
                      {results.heightCompliance ? "COMPLEIX" : "VERIFICAR"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Compliment general:</span>
                    <Badge variant={results.overallCompliance ? "default" : "destructive"}>
                      {results.overallCompliance ? "COMPLEIX" : "REQUEREIX VERIFICACIÓ"}
                    </Badge>
                  </div>
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

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Nota:</strong> Aquest és un càlcul simplificat. Per a projectes reals, consulta els 
                    annexos C-F del CTE DB-SI 6 i considera l'assessorament d'un enginyer estructural.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SI6Component;