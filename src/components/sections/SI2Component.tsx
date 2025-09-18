import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SI2Component = () => {
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
    let minDistance = 3; // Distància mínima base
    let maxOpeningPercentage = 60; // Percentatge màxim d'obertures
    let requiredMaterial = "B-s1,d0";
    const recommendations: string[] = [];

    // Càlcul de distància mínima segons alçada
    if (heightNum > 15) {
      minDistance = Math.max(3, heightNum * 0.2);
    }

    // Ajust segons percentatge d'obertures
    if (openingNum > 40) {
      minDistance = minDistance * 1.5;
    }

    // Verificar distància
    if (distanceNum < minDistance) {
      recommendations.push(`Augmentar distància a ${minDistance.toFixed(1)}m`);
      recommendations.push("Reduir percentatge d'obertures");
      recommendations.push("Millorar materials de façana");
    }

    // Verificar obertures
    if (openingNum > maxOpeningPercentage) {
      recommendations.push(`Reduir obertures per sota del ${maxOpeningPercentage}%`);
    }

    // Verificar materials segons alçada
    if (heightNum > 18) {
      requiredMaterial = "A2-s1,d0";
      if (!["a1", "a2"].includes(formData.facadeMaterial)) {
        recommendations.push("Utilitzar materials A1 o A2-s1,d0 per façanes altes");
      }
    }

    const compliance = distanceNum >= minDistance && 
                      openingNum <= maxOpeningPercentage &&
                      (heightNum <= 18 || ["a1", "a2"].includes(formData.facadeMaterial));

    setResults({
      minDistance,
      maxOpeningPercentage,
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
                    <span className="font-medium">Màx. obertures:</span>
                    <Badge variant="outline">{results.maxOpeningPercentage}%</Badge>
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