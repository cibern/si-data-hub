import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Calculator } from "lucide-react";
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

interface SI1ComponentProps {
  projectData: ProjectData;
}

const SI1Component = ({ projectData }: SI1ComponentProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    usBuilding: "",
    surfaceArea: "",
    height: "",
    compartmentArea: "",
    materialType: "",
  });
  
  const [results, setResults] = useState({
    maxCompartmentArea: 0,
    requiredResistance: "",
    compliance: false,
    recommendations: [] as string[],
  });

  const usosBuilding = [
    { value: "residential", label: "Residencial" },
    { value: "office", label: "Oficines" },
    { value: "commercial", label: "Comercial" },
    { value: "industrial", label: "Industrial" },
    { value: "educational", label: "Educatiu" },
    { value: "healthcare", label: "Sanitari" },
    { value: "hotel", label: "Hoteler" },
  ];

  const materialTypes = [
    { value: "a1", label: "A1 - No combustible" },
    { value: "a2", label: "A2 - Combustibilitat molt limitada" },
    { value: "b", label: "B - Combustible amb contribució limitada" },
    { value: "c", label: "C - Combustible amb contribució moderada" },
    { value: "d", label: "D - Combustible amb contribució acceptable" },
  ];

  const calculateCompliance = () => {
    const surfaceNum = parseFloat(formData.surfaceArea);
    const heightNum = parseFloat(formData.height);
    const compartmentNum = parseFloat(formData.compartmentArea);

    // Usar dades del projecte general si están disponibles
    const usBuilding = formData.usBuilding || projectData.usBuilding;
    const height = heightNum || parseFloat(projectData.evacuationHeight);

    if (!surfaceNum || !height || !compartmentNum || !usBuilding) {
      toast({
        title: "Error",
        description: "Si us plau, omple tots els camps necessaris",
        variant: "destructive",
      });
      return;
    }

    // Càlculs segons CTE DB-SI
    let maxArea = 2500; // Àrea màxima per defecte
    let resistance = "EI 60";
    const recommendations: string[] = [];

    // Ajustaments segons ús
    switch (usBuilding) {
      case "residential":
        maxArea = height > 15 ? 1000 : 2500;
        resistance = height > 15 ? "EI 90" : "EI 60";
        break;
      case "office":
        maxArea = 2500;
        resistance = "EI 60";
        break;
      case "commercial":
        maxArea = height > 10 ? 1500 : 2500;
        resistance = height > 10 ? "EI 90" : "EI 60";
        break;
      case "industrial":
        maxArea = 1000;
        resistance = "EI 90";
        break;
      default:
        maxArea = 2500;
        resistance = "EI 60";
    }

    // Verificar compliment
    const compliance = compartmentNum <= maxArea;

    if (!compliance) {
      recommendations.push("Reduir l'àrea del sector d'incendi");
      recommendations.push("Instal·lar sistemes d'extinció automàtica");
      recommendations.push("Millorar la compartimentació");
    }

    if (height > 28) {
      recommendations.push("Complir requisits addicionals per edificis d'alçada");
      resistance = "EI 120";
    }

    setResults({
      maxCompartmentArea: maxArea,
      requiredResistance: resistance,
      compliance,
      recommendations,
    });

    toast({
      title: compliance ? "Compliment verificat" : "Incompliment detectat",
      description: compliance 
        ? "El projecte compleix amb SI 1" 
        : "Revisa les recomanacions per complir",
      variant: compliance ? "default" : "destructive",
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
              <Calculator className="h-5 w-5 text-primary" />
              Dades del projecte
            </CardTitle>
            <CardDescription>
              Introdueix les característiques del edifici per verificar el compliment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usBuilding">Ús de l'edifici</Label>
              <Select 
                value={formData.usBuilding || projectData.usBuilding} 
                onValueChange={(value) => handleInputChange("usBuilding", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={projectData.usBuilding ? 
                    usosBuilding.find(u => u.value === projectData.usBuilding)?.label : 
                    "Selecciona l'ús"} />
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
                <Label htmlFor="surfaceArea">Superfície total (m²)</Label>
                <Input
                  id="surfaceArea"
                  type="number"
                  value={formData.surfaceArea}
                  onChange={(e) => handleInputChange("surfaceArea", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Alçada evacuació (m)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height || projectData.evacuationHeight}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder={projectData.evacuationHeight || "0"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compartmentArea">Àrea del sector d'incendi (m²)</Label>
              <Input
                id="compartmentArea"
                type="number"
                value={formData.compartmentArea}
                onChange={(e) => handleInputChange("compartmentArea", e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialType">Tipus de materials</Label>
              <Select value={formData.materialType} onValueChange={(value) => handleInputChange("materialType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipus" />
                </SelectTrigger>
                <SelectContent>
                  {materialTypes.map(material => (
                    <SelectItem key={material.value} value={material.value}>
                      {material.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={calculateCompliance} 
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              Calcular compliment SI 1
            </Button>
          </CardContent>
        </Card>

        {/* Resultats */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.compliance ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              Resultats del càlcul
            </CardTitle>
            <CardDescription>
              Verificació del compliment de propagació interior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.maxCompartmentArea > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Àrea màxima permesa:</span>
                    <Badge variant="secondary">{results.maxCompartmentArea} m²</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Resistència requerida:</span>
                    <Badge variant="outline">{results.requiredResistance}</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Estat de compliment:</span>
                    <Badge variant={results.compliance ? "default" : "destructive"}>
                      {results.compliance ? "COMPLEIX" : "NO COMPLEIX"}
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SI1Component;