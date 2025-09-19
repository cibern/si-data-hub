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

interface SI2ComponentProps {
  projectData: ProjectData;
}

const SI2Component = ({ projectData }: SI2ComponentProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    facadeHeight: "",
    distanceToProperty: "",
    openingPercentage: "",
    facadeMaterial: "",
    adjacentBuilding: "",
  });
  
  const [results, setResults] = useState({
    minDistance: 0,
    maxOpeningPercentage: 0,
    requiredMaterial: "",
    compliance: false,
    recommendations: [] as string[],
  });

  const facadeMaterials = [
    { value: "a1", label: "A1 - No combustible" },
    { value: "a2", label: "A2-s1,d0" },
    { value: "b", label: "B-s1,d0" },
    { value: "c", label: "C-s2,d1" },
    { value: "d", label: "D-s3,d2" },
  ];

  const calculateExteriorPropagation = () => {
    const heightNum = parseFloat(formData.facadeHeight);
    const distanceNum = parseFloat(formData.distanceToProperty);
    const openingNum = parseFloat(formData.openingPercentage);

    if (!heightNum || !distanceNum || !openingNum || !formData.facadeMaterial) {
      toast({
        title: "Error",
        description: "Si us plau, omple tots els camps necessaris",
        variant: "destructive",
      });
      return;
    }

    // Càlculs segons CTE DB-SI 2
    let minDistance = 3.0; // Distància mínima base per façanes enfrontades (α=0°)
    let requiredMaterial = "D-s3,d0";
    const recommendations: string[] = [];

    // Verificar materials segons alçada (punt 4 de SI2)
    if (heightNum <= 10) {
      requiredMaterial = "D-s3,d0";
    } else if (heightNum <= 18) {
      requiredMaterial = "C-s3,d0";
    } else {
      requiredMaterial = "B-s3,d0";
    }

    // Verificar si el material actual compleix
    const materialValues = { "d": 1, "c": 2, "b": 3, "a2": 4, "a1": 5 };
    const requiredValue = materialValues[requiredMaterial.charAt(0).toLowerCase()];
    const currentValue = materialValues[formData.facadeMaterial];

    if (currentValue < requiredValue) {
      recommendations.push(`Material inadequat. Es requereix ${requiredMaterial} o superior`);
    }

    // Verificar franja EI 60 per propagació vertical (punt 3)
    if (heightNum > 6) {
      recommendations.push("Assegurar franja EI 60 de 1m d'altura en encuentro forjado-fachada");
    }

    // Verificar distància segons normativa (punt 2)
    if (distanceNum < minDistance) {
      recommendations.push(`Augmentar distància a ${minDistance.toFixed(1)}m mínim`);
      recommendations.push("O millorar resistència al foc dels elements (EI 60)");
    }

    // Verificacions especials per façanes baixes accessibles (punt 6)
    if (heightNum <= 18) {
      recommendations.push("Si la façana és accessible al públic, material mínim B-s3,d0 fins 3,5m");
    }

    // Verificacions per cámaras ventiladas (punt 5)
    if (heightNum <= 10) {
      recommendations.push("Aïllament en càmares ventilades: mínim D-s3,d0");
    } else if (heightNum <= 28) {
      recommendations.push("Aïllament en càmares ventilades: mínim B-s3,d0");
    } else {
      recommendations.push("Aïllament en càmares ventilades: mínim A2-s3,d0");
    }

    const compliance = distanceNum >= minDistance && 
                      currentValue >= requiredValue;

    setResults({
      minDistance,
      maxOpeningPercentage: 0, // No s'especifica límit en SI2
      requiredMaterial,
      compliance,
      recommendations,
    });

    toast({
      title: compliance ? "Compliment verificat" : "Incompliment detectat",
      description: compliance 
        ? "El projecte compleix amb SI 2" 
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
              <Calculator className="h-5 w-5 text-warning" />
              Dades de propagació exterior
            </CardTitle>
            <CardDescription>
              Característiques de façana i entorn per verificar SI 2
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facadeHeight">Alçada de façana (m)</Label>
                <Input
                  id="facadeHeight"
                  type="number"
                  value={formData.facadeHeight}
                  onChange={(e) => handleInputChange("facadeHeight", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distanceToProperty">Distància a límit (m)</Label>
                <Input
                  id="distanceToProperty"
                  type="number"
                  value={formData.distanceToProperty}
                  onChange={(e) => handleInputChange("distanceToProperty", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openingPercentage">Percentatge d'obertures (%)</Label>
              <Input
                id="openingPercentage"
                type="number"
                value={formData.openingPercentage}
                onChange={(e) => handleInputChange("openingPercentage", e.target.value)}
                placeholder="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facadeMaterial">Material de façana</Label>
              <Select value={formData.facadeMaterial} onValueChange={(value) => handleInputChange("facadeMaterial", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el material" />
                </SelectTrigger>
                <SelectContent>
                  {facadeMaterials.map(material => (
                    <SelectItem key={material.value} value={material.value}>
                      {material.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjacentBuilding">Edifici adjacent</Label>
              <Select value={formData.adjacentBuilding} onValueChange={(value) => handleInputChange("adjacentBuilding", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipus d'edifici adjacent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sense edifici adjacent</SelectItem>
                  <SelectItem value="residential">Residencial</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={calculateExteriorPropagation} 
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              Calcular compliment SI 2
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
              Resultats propagació exterior
            </CardTitle>
            <CardDescription>
              Verificació del compliment de propagació exterior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.minDistance > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Distància mínima:</span>
                    <Badge variant="secondary">{results.minDistance.toFixed(1)} m</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Resistència vertical:</span>
                    <Badge variant="outline">EI 60 (1m altura)</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Material requerit:</span>
                    <Badge variant="outline">{results.requiredMaterial}</Badge>
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

export default SI2Component;