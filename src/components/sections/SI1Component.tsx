import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Calculator, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FieldHelp } from "@/components/ui/field-help";

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
  si1: {
    compartmentArea: string;
    materialType: string;
    installsAutomaticExtinction: boolean;
  };
  si2: any;
  si3: any;
  si4: any;
  si5: any;
  si6: any;
}

interface SI1ComponentProps {
  projectData: ProjectData;
  siData: SiData;
  onSiDataChange: (data: SiData) => void;
  onSiResultChange: (result: any) => void;
}

const SI1Component = ({ projectData, siData, onSiDataChange, onSiResultChange }: SI1ComponentProps) => {
  const { toast } = useToast();
  
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
    const surfaceNum = parseFloat(projectData.totalSurface);
    const heightNum = parseFloat(projectData.evacuationHeight);
    const compartmentNum = parseFloat(siData.si1.compartmentArea);

    if (!surfaceNum || !heightNum || !compartmentNum || !projectData.usBuilding) {
      toast({
        title: "Error",
        description: "Si us plau, omple tots els camps necessaris (revisa les dades generals)",
        variant: "destructive",
      });
      return;
    }

    // Càlculs segons CTE DB-SI
    let maxArea = 2500; // Àrea màxima per defecte
    let resistance = "EI 60";
    const recommendations: string[] = [];

    // Ajustaments segons ús
    switch (projectData.usBuilding) {
      case "residential":
        maxArea = heightNum > 15 ? 1000 : 2500;
        resistance = heightNum > 15 ? "EI 90" : "EI 60";
        break;
      case "office":
        maxArea = 2500;
        resistance = "EI 60";
        break;
      case "commercial":
        maxArea = heightNum > 10 ? 1500 : 2500;
        resistance = heightNum > 10 ? "EI 90" : "EI 60";
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

    if (heightNum > 28) {
      recommendations.push("Complir requisits addicionals per edificis d'alçada");
      resistance = "EI 120";
    }

    const newResults = {
      maxCompartmentArea: maxArea,
      requiredResistance: resistance,
      compliance,
      recommendations,
    };

    setResults(newResults);

    // Actualitzar resultats globals
    onSiResultChange({
      title: "SI 1 - Propagació interior",
      compliance,
      calculations: [
        { label: "Àrea màxima permesa", value: `${maxArea} m²` },
        { label: "Resistència requerida", value: resistance },
        { label: "Àrea del sector", value: `${compartmentNum} m²` },
      ],
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

  const handleInputChange = (field: string, value: string | boolean) => {
    onSiDataChange({
      ...siData,
      si1: { ...siData.si1, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulari d'entrada */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Dades específiques SI 1
            </CardTitle>
            <CardDescription>
              Completa les dades específiques per verificar la propagació interior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Dades generals (des de l'inici):</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Ús: <Badge variant="secondary">{projectData.usBuilding}</Badge></div>
                <div>Superfície: <Badge variant="outline">{projectData.totalSurface} m²</Badge></div>
                <div>Alçada: <Badge variant="outline">{projectData.evacuationHeight} m</Badge></div>
                <div>Plantes: <Badge variant="outline">{projectData.floors}</Badge></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="compartmentArea">Àrea del sector d'incendi (m²)</Label>
                <FieldHelp content="Àrea màxima del sector d'incendi segons les característiques constructives i l'ús de l'edifici." />
              </div>
              <Input
                id="compartmentArea"
                type="number"
                value={siData.si1.compartmentArea}
                onChange={(e) => handleInputChange("compartmentArea", e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="materialType">Tipus de materials</Label>
                <FieldHelp content="Classificació dels materials segons la seva reacció al foc (A1, A2, B, C, D). A1 és incombustible." />
              </div>
              <Select value={siData.si1.materialType} onValueChange={(value) => handleInputChange("materialType", value)}>
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

            <div className="flex gap-4">
              <Button 
                onClick={calculateCompliance} 
                className="flex-1 bg-gradient-primary hover:opacity-90 transition-smooth"
              >
                Calcular compliment SI 1
              </Button>
              
              <Button variant="outline" asChild>
                <a href="/CTE_DB_Si1.pdf" download className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  PDF SI1
                </a>
              </Button>
            </div>
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