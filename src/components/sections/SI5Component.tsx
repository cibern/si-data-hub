import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Truck, Map } from "lucide-react";
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

interface SI5ComponentProps {
  projectData: ProjectData;
}

const SI5Component = ({ projectData }: SI5ComponentProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    buildingHeight: "",
    buildingDepth: "",
    accessWidth: "",
    approachDistance: "",
    accessSlope: "",
    turningRadius: "",
    loadCapacity: "",
    hydrantDistance: "",
    buildingUse: "",
  });
  
  const [results, setResults] = useState({
    requiredAccess: "",
    minAccessWidth: 0,
    maxApproachDistance: 0,
    hydrantCompliance: false,
    accessCompliance: false,
    approachCompliance: false,
    recommendations: [] as string[],
  });

  const buildingUses = [
    { value: "residential", label: "Residencial" },
    { value: "office", label: "Administratiu" },
    { value: "commercial", label: "Comercial" },
    { value: "assembly", label: "Pública concurrència" },
    { value: "industrial", label: "Industrial" },
    { value: "healthcare", label: "Sanitari" },
  ];

  const calculateFireAccess = () => {
    const heightNum = parseFloat(formData.buildingHeight);
    const depthNum = parseFloat(formData.buildingDepth);
    const widthNum = parseFloat(formData.accessWidth);
    const distanceNum = parseFloat(formData.approachDistance);
    const hydrantNum = parseFloat(formData.hydrantDistance);

    if (!heightNum || !depthNum || !widthNum || !distanceNum || !formData.buildingUse) {
      toast({
        title: "Error",
        description: "Si us plau, omple tots els camps necessaris",
        variant: "destructive",
      });
      return;
    }

    let requiredAccess = "Estàndard";
    let minAccessWidth = 3.5;
    let maxApproachDistance = 30;
    const recommendations: string[] = [];

    if (heightNum > 15 || ["healthcare", "assembly"].includes(formData.buildingUse)) {
      requiredAccess = "Reforçat";
      minAccessWidth = 5.0;
      maxApproachDistance = 18;
    }

    if (heightNum > 28) {
      requiredAccess = "Especial";
      minAccessWidth = 6.0;
      maxApproachDistance = 10;
    }

    const accessCompliance = widthNum >= minAccessWidth;
    const approachCompliance = distanceNum <= maxApproachDistance;
    const hydrantCompliance = hydrantNum <= 100;

    if (!accessCompliance) {
      recommendations.push(`Amplada d'accés insuficient. Mínim: ${minAccessWidth}m`);
    }

    if (!approachCompliance) {
      recommendations.push(`Distància d'aproximació excessiva. Màxim: ${maxApproachDistance}m`);
    }

    if (!hydrantCompliance) {
      recommendations.push("Hidrant massa lluny (màxim 100m de l'edifici)");
    }

    setResults({
      requiredAccess,
      minAccessWidth,
      maxApproachDistance,
      hydrantCompliance,
      accessCompliance,
      approachCompliance,
      recommendations,
    });

    const overallCompliance = accessCompliance && approachCompliance && hydrantCompliance;

    toast({
      title: overallCompliance ? "Compliment verificat" : "Incompliment detectat",
      description: overallCompliance 
        ? "L'accés de bombers compleix SI 5" 
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
              <Truck className="h-5 w-5 text-primary" />
              Accessibilitat per bombers
            </CardTitle>
            <CardDescription>
              Paràmetres per verificar l'accés i aproximació dels bombers
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
                <Label htmlFor="buildingDepth">Profunditat edifici (m)</Label>
                <Input
                  id="buildingDepth"
                  type="number"
                  value={formData.buildingDepth}
                  onChange={(e) => handleInputChange("buildingDepth", e.target.value)}
                  placeholder="0"
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
                <Label htmlFor="accessWidth">Amplada d'accés (m)</Label>
                <Input
                  id="accessWidth"
                  type="number"
                  step="0.1"
                  value={formData.accessWidth}
                  onChange={(e) => handleInputChange("accessWidth", e.target.value)}
                  placeholder="3.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approachDistance">Distància aproximació (m)</Label>
                <Input
                  id="approachDistance"
                  type="number"
                  value={formData.approachDistance}
                  onChange={(e) => handleInputChange("approachDistance", e.target.value)}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hydrantDistance">Distància hidrant (m)</Label>
              <Input
                id="hydrantDistance"
                type="number"
                value={formData.hydrantDistance}
                onChange={(e) => handleInputChange("hydrantDistance", e.target.value)}
                placeholder="100"
              />
            </div>

            <Button 
              onClick={calculateFireAccess} 
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              Verificar accés bombers SI 5
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.accessCompliance && results.approachCompliance && results.hydrantCompliance ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              Resultats accés bombers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.requiredAccess && (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Tipus d'accés:</span>
                    <Badge variant="secondary">{results.requiredAccess}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Amplada mínima:</span>
                    <Badge variant="outline">{results.minAccessWidth} m</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Distància màxima:</span>
                    <Badge variant="outline">{results.maxApproachDistance} m</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Accés conforme:</span>
                    <Badge variant={results.accessCompliance ? "default" : "destructive"}>
                      {results.accessCompliance ? "COMPLEIX" : "NO COMPLEIX"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Aproximació conforme:</span>
                    <Badge variant={results.approachCompliance ? "default" : "destructive"}>
                      {results.approachCompliance ? "COMPLEIX" : "NO COMPLEIX"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Hidrant conforme:</span>
                    <Badge variant={results.hydrantCompliance ? "default" : "destructive"}>
                      {results.hydrantCompliance ? "COMPLEIX" : "NO COMPLEIX"}
                    </Badge>
                  </div>
                </div>

                {results.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Recomanacions:</h4>
                    <ul className="space-y-1">
                      {results.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm bg-accent p-2 rounded flex items-start gap-2">
                          <Map className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />
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

export default SI5Component;