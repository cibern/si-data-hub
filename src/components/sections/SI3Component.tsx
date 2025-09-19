import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Calculator, Users } from "lucide-react";
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

interface SI3ComponentProps {
  projectData: ProjectData;
  siData: any;
  onSiDataChange: (data: any) => void;
}

const SI3Component = ({ projectData, siData, onSiDataChange }: SI3ComponentProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    usBuilding: "",
    totalArea: "",
    floorArea: "",
    occupantLoad: "",
    exitWidth: "",
    travelDistance: "",
    numberOfFloors: "",
  });
  
  const [results, setResults] = useState({
    calculatedOccupancy: 0,
    requiredExitWidth: 0,
    maxTravelDistance: 0,
    requiredExits: 0,
    compliance: false,
    recommendations: [] as string[],
  });

  const usosBuilding = [
    { value: "residential", label: "Residencial", density: 20 },
    { value: "office", label: "Oficines", density: 10 },
    { value: "commercial", label: "Comercial", density: 2 },
    { value: "restaurant", label: "Restaurant", density: 1.5 },
    { value: "educational", label: "Educatiu", density: 1.5 },
    { value: "healthcare", label: "Sanitari", density: 6 },
    { value: "assembly", label: "Reunió", density: 1 },
  ];

  const calculateEvacuation = () => {
    const totalAreaNum = parseFloat(formData.totalArea);
    const floorAreaNum = parseFloat(formData.floorArea);
    const occupantLoadNum = parseFloat(formData.occupantLoad);
    const exitWidthNum = parseFloat(formData.exitWidth);
    const travelDistanceNum = parseFloat(formData.travelDistance);
    const floorsNum = parseFloat(formData.numberOfFloors);

    if (!totalAreaNum || !floorAreaNum || !exitWidthNum || !travelDistanceNum || !formData.usBuilding) {
      toast({
        title: "Error",
        description: "Si us plau, omple tots els camps necessaris",
        variant: "destructive",
      });
      return;
    }

    const selectedUse = usosBuilding.find(u => u.value === formData.usBuilding);
    if (!selectedUse) return;

    // Càlculs segons CTE DB-SI 3
    const calculatedOccupancy = occupantLoadNum || Math.ceil(floorAreaNum / selectedUse.density);
    
    // Amplada de sortides requerida (A = P/200)
    const requiredExitWidth = Math.ceil(calculatedOccupancy / 200) * 0.80; // 80cm per cada 200 persones
    
    // Distància màxima de recorregut
    let maxTravelDistance = 50; // Per defecte
    if (floorsNum > 1) {
      maxTravelDistance = 35;
    }
    if (["commercial", "assembly"].includes(formData.usBuilding)) {
      maxTravelDistance = 30;
    }

    // Nombre de sortides requerides
    let requiredExits = 1;
    if (calculatedOccupancy > 100) requiredExits = 2;
    if (calculatedOccupancy > 500) requiredExits = 3;
    if (floorAreaNum > 1500) requiredExits = Math.max(requiredExits, 2);

    const recommendations: string[] = [];

    // Verificacions
    if (exitWidthNum < requiredExitWidth) {
      recommendations.push(`Augmentar amplada de sortides a ${requiredExitWidth.toFixed(2)}m mínim`);
    }

    if (travelDistanceNum > maxTravelDistance) {
      recommendations.push(`Reduir distància de recorregut per sota de ${maxTravelDistance}m`);
      recommendations.push("Afegir sortides addicionals");
    }

    if (calculatedOccupancy > 500 && floorsNum > 3) {
      recommendations.push("Considerar ascensor d'emergència");
    }

    if (["assembly", "commercial"].includes(formData.usBuilding) && calculatedOccupancy > 300) {
      recommendations.push("Implementar sistema de megafonia");
      recommendations.push("Senyalització lumínica d'emergència");
    }

    const compliance = exitWidthNum >= requiredExitWidth && 
                      travelDistanceNum <= maxTravelDistance;

    setResults({
      calculatedOccupancy,
      requiredExitWidth,
      maxTravelDistance,
      requiredExits,
      compliance,
      recommendations,
    });

    toast({
      title: compliance ? "Compliment verificat" : "Incompliment detectat",
      description: compliance 
        ? "El projecte compleix amb SI 3" 
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
              <Users className="h-5 w-5 text-primary" />
              Dades d'evacuació d'ocupants
            </CardTitle>
            <CardDescription>
              Característiques per calcular capacitat d'evacuació
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
                      {us.label} ({us.density} m²/pers)
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
                <Label htmlFor="floorArea">Superfície per planta (m²)</Label>
                <Input
                  id="floorArea"
                  type="number"
                  value={formData.floorArea}
                  onChange={(e) => handleInputChange("floorArea", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupantLoad">Aforament previst (opcional)</Label>
                <Input
                  id="occupantLoad"
                  type="number"
                  value={formData.occupantLoad}
                  onChange={(e) => handleInputChange("occupantLoad", e.target.value)}
                  placeholder="Calcul automàtic"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exitWidth">Amplada sortides (m)</Label>
                <Input
                  id="exitWidth"
                  type="number"
                  step="0.1"
                  value={formData.exitWidth}
                  onChange={(e) => handleInputChange("exitWidth", e.target.value)}
                  placeholder="0.8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="travelDistance">Distància recorregut (m)</Label>
                <Input
                  id="travelDistance"
                  type="number"
                  value={formData.travelDistance}
                  onChange={(e) => handleInputChange("travelDistance", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <Button 
              onClick={calculateEvacuation} 
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              Calcular compliment SI 3
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
              Resultats d'evacuació
            </CardTitle>
            <CardDescription>
              Verificació de capacitat d'evacuació d'ocupants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.calculatedOccupancy > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Aforament calculat:</span>
                    <Badge variant="secondary">{results.calculatedOccupancy} persones</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Amplada sortides req.:</span>
                    <Badge variant="outline">{results.requiredExitWidth.toFixed(2)} m</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Distància màxima:</span>
                    <Badge variant="outline">{results.maxTravelDistance} m</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Sortides requerides:</span>
                    <Badge variant="outline">{results.requiredExits}</Badge>
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

export default SI3Component;