import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2, Calculator, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SI5Component = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    buildingHeight: "",
    buildingWidth: "",
    accessRoadWidth: "",
    distanceToAccess: "",
    hasHydrants: false,
    hydrantDistance: "",
    hasFireLift: false,
    accessibleRoof: false,
  });
  
  const [results, setResults] = useState({
    requiredRoadWidth: 0,
    maxDistanceToBuilding: 0,
    requiredHydrants: 0,
    needsFireLift: false,
    compliance: false,
    recommendations: [] as string[],
  });

  const calculateFireAccess = () => {
    const heightNum = parseFloat(formData.buildingHeight);
    const widthNum = parseFloat(formData.buildingWidth);
    const roadWidthNum = parseFloat(formData.accessRoadWidth);
    const distanceNum = parseFloat(formData.distanceToAccess);
    const hydrantDistanceNum = parseFloat(formData.hydrantDistance);

    if (!heightNum || !widthNum || !roadWidthNum || !distanceNum) {
      toast({
        title: "Error",
        description: "Si us plau, omple tots els camps necessaris",
        variant: "destructive",
      });
      return;
    }

    // Càlculs segons CTE DB-SI 5
    let requiredRoadWidth = 3.5; // Amplada mínima base
    let maxDistanceToBuilding = 30; // Distància màxima base
    let requiredHydrants = 0;
    let needsFireLift = false;
    const recommendations: string[] = [];

    // Amplada de vials segons alçada
    if (heightNum > 15) {
      requiredRoadWidth = 6;
      maxDistanceToBuilding = 15;
    }
    if (heightNum > 28) {
      requiredRoadWidth = 8;
      maxDistanceToBuilding = 10;
      needsFireLift = true;
    }

    // Hidrants exteriors
    if (heightNum > 15 || widthNum > 5000) {
      requiredHydrants = Math.ceil(Math.max(heightNum / 15, widthNum / 5000));
    }

    // Verificacions de compliment
    if (roadWidthNum < requiredRoadWidth) {
      recommendations.push(`Ampliar vial d'accés a ${requiredRoadWidth}m mínim`);
    }

    if (distanceNum > maxDistanceToBuilding) {
      recommendations.push(`Reduir distància d'accés a ${maxDistanceToBuilding}m màxim`);
    }

    if (needsFireLift && !formData.hasFireLift) {
      recommendations.push("Instal·lar ascensor d'emergència per edificis alts");
    }

    if (requiredHydrants > 0 && !formData.hasHydrants) {
      recommendations.push(`Instal·lar ${requiredHydrants} hidrant(s) exterior(s)`);
    }

    if (formData.hasHydrants && hydrantDistanceNum > 100) {
      recommendations.push("Reduir distància a hidrants per sota de 100m");
    }

    if (heightNum > 15 && !formData.accessibleRoof) {
      recommendations.push("Assegurar accessibilitat de coberta per bombers");
    }

    // Espai de maniobra
    if (heightNum > 15) {
      recommendations.push("Reservar espai de maniobra mínim 7x18m davant façana");
    }

    // Pendent del vial
    if (heightNum > 28) {
      recommendations.push("Pendent del vial d'accés no superior al 5%");
      recommendations.push("Resistència del paviment mínima 20 Tn per eix");
    }

    const compliance = roadWidthNum >= requiredRoadWidth && 
                      distanceNum <= maxDistanceToBuilding &&
                      (!needsFireLift || formData.hasFireLift) &&
                      (requiredHydrants === 0 || formData.hasHydrants);

    setResults({
      requiredRoadWidth,
      maxDistanceToBuilding,
      requiredHydrants,
      needsFireLift,
      compliance,
      recommendations,
    });

    toast({
      title: compliance ? "Compliment verificat" : "Incompliment detectat",
      description: compliance 
        ? "L'accés per bombers compleix amb SI 5" 
        : "Revisa les recomanacions per complir",
      variant: compliance ? "default" : "destructive",
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
              <Truck className="h-5 w-5 text-accent-foreground" />
              Accés per a intervenció de bombers
            </CardTitle>
            <CardDescription>
              Condicions d'accessibilitat i aproximació dels bombers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="buildingWidth">Longitud façana (m)</Label>
                <Input
                  id="buildingWidth"
                  type="number"
                  value={formData.buildingWidth}
                  onChange={(e) => handleInputChange("buildingWidth", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accessRoadWidth">Amplada vial (m)</Label>
                <Input
                  id="accessRoadWidth"
                  type="number"
                  step="0.5"
                  value={formData.accessRoadWidth}
                  onChange={(e) => handleInputChange("accessRoadWidth", e.target.value)}
                  placeholder="3.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distanceToAccess">Distància a façana (m)</Label>
                <Input
                  id="distanceToAccess"
                  type="number"
                  value={formData.distanceToAccess}
                  onChange={(e) => handleInputChange("distanceToAccess", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hydrantDistance">Distància a hidrant (m)</Label>
              <Input
                id="hydrantDistance"
                type="number"
                value={formData.hydrantDistance}
                onChange={(e) => handleInputChange("hydrantDistance", e.target.value)}
                placeholder="100"
              />
            </div>

            <div className="space-y-3">
              <Label>Equipaments disponibles:</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasHydrants"
                    checked={formData.hasHydrants}
                    onCheckedChange={(checked) => handleCheckboxChange("hasHydrants", checked as boolean)}
                  />
                  <Label htmlFor="hasHydrants" className="text-sm">Hidrants exteriors</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasFireLift"
                    checked={formData.hasFireLift}
                    onCheckedChange={(checked) => handleCheckboxChange("hasFireLift", checked as boolean)}
                  />
                  <Label htmlFor="hasFireLift" className="text-sm">Ascensor d'emergència</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="accessibleRoof"
                    checked={formData.accessibleRoof}
                    onCheckedChange={(checked) => handleCheckboxChange("accessibleRoof", checked as boolean)}
                  />
                  <Label htmlFor="accessibleRoof" className="text-sm">Coberta accessible</Label>
                </div>
              </div>
            </div>

            <Button 
              onClick={calculateFireAccess} 
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              Verificar accés SI 5
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
              Resultats d'accés bombers
            </CardTitle>
            <CardDescription>
              Verificació de condicions d'intervenció
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.requiredRoadWidth > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Amplada vial req.:</span>
                    <Badge variant="secondary">{results.requiredRoadWidth} m</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Distància màxima:</span>
                    <Badge variant="outline">{results.maxDistanceToBuilding} m</Badge>
                  </div>

                  {results.requiredHydrants > 0 && (
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">Hidrants necessaris:</span>
                      <Badge variant="outline">{results.requiredHydrants}</Badge>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Ascensor emergència:</span>
                    <Badge variant={results.needsFireLift ? "destructive" : "secondary"}>
                      {results.needsFireLift ? "NECESSARI" : "NO NECESSARI"}
                    </Badge>
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

export default SI5Component;