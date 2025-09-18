import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Calculator, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SI6Component = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    structureType: "",
    usBuilding: "",
    buildingHeight: "",
    loadLevel: "",
    structuralElement: "",
    exposedSurface: "",
  });
  
  const [results, setResults] = useState({
    requiredResistance: "",
    structuralStability: "",
    sectioning: "",
    compliance: false,
    recommendations: [] as string[],
  });

  const structureTypes = [
    { value: "concrete", label: "Formigó armat" },
    { value: "steel", label: "Estructura metàl·lica" },
    { value: "wood", label: "Fusta" },
    { value: "masonry", label: "Obra de fàbrica" },
    { value: "mixed", label: "Estructura mixta" },
  ];

  const usosBuilding = [
    { value: "residential", label: "Residencial" },
    { value: "office", label: "Oficines" },
    { value: "commercial", label: "Comercial" },
    { value: "industrial", label: "Industrial" },
    { value: "educational", label: "Educatiu" },
    { value: "healthcare", label: "Sanitari" },
  ];

  const loadLevels = [
    { value: "low", label: "Sobrecàrrega baixa (<3 kN/m²)" },
    { value: "medium", label: "Sobrecàrrega mitjana (3-5 kN/m²)" },
    { value: "high", label: "Sobrecàrrega alta (>5 kN/m²)" },
  ];

  const structuralElements = [
    { value: "pillar", label: "Pilars" },
    { value: "beam", label: "Bigues" },
    { value: "slab", label: "Forjats" },
    { value: "wall", label: "Murs portants" },
    { value: "stair", label: "Escales" },
  ];

  const calculateFireResistance = () => {
    const heightNum = parseFloat(formData.buildingHeight);
    const exposedSurfaceNum = parseFloat(formData.exposedSurface);

    if (!heightNum || !formData.structureType || !formData.usBuilding || !formData.loadLevel) {
      toast({
        title: "Error",
        description: "Si us plau, omple tots els camps necessaris",
        variant: "destructive",
      });
      return;
    }

    // Càlculs segons CTE DB-SI 6
    let requiredResistance = "R 60";
    let structuralStability = "R 90";
    let sectioning = "REI 60";
    const recommendations: string[] = [];

    // Resistència segons alçada i ús
    if (heightNum <= 15) {
      requiredResistance = "R 60";
      structuralStability = "R 90";
    } else if (heightNum <= 28) {
      requiredResistance = "R 90";
      structuralStability = "R 120";
      sectioning = "REI 90";
    } else {
      requiredResistance = "R 120";
      structuralStability = "R 180";
      sectioning = "REI 120";
    }

    // Ajustaments segons ús
    if (["healthcare", "educational"].includes(formData.usBuilding)) {
      if (heightNum > 15) {
        requiredResistance = "R 120";
        structuralStability = "R 180";
      }
    }

    if (formData.usBuilding === "industrial") {
      if (formData.loadLevel === "high") {
        requiredResistance = "R 90";
        structuralStability = "R 120";
      }
    }

    // Ajustaments segons tipus d'estructura
    switch (formData.structureType) {
      case "steel":
        recommendations.push("Aplicar protecció passiva a l'estructura metàl·lica");
        if (heightNum > 28) {
          recommendations.push("Considerar perfils de major secció o protecció addicional");
        }
        break;
      case "wood":
        recommendations.push("Verificar secció resistent després de carbonització");
        if (heightNum > 15) {
          recommendations.push("Estructura de fusta limitada per alçada superior a 15m");
        }
        break;
      case "concrete":
        recommendations.push("Verificar recobriment mínim d'armadures");
        break;
    }

    // Recomanacions per elements
    if (formData.structuralElement === "pillar") {
      recommendations.push("Els pilars han de mantenir capacitat portant durant l'incendi");
    }
    if (formData.structuralElement === "beam") {
      recommendations.push("Verificar deformació màxima de bigues sota foc");
    }
    if (formData.structuralElement === "slab") {
      recommendations.push("Forjats han de mantenir compartimentació horitzontal");
    }

    // Verificacions especials
    if (exposedSurfaceNum && exposedSurfaceNum > 100) {
      recommendations.push("Reduir superfície exposada o augmentar protecció");
    }

    if (heightNum > 50) {
      recommendations.push("Edificis singulars requereixen estudi específic");
      requiredResistance = "R 180";
      structuralStability = "R 240";
    }

    // Protecció passiva
    if (formData.structureType === "steel" && heightNum > 15) {
      recommendations.push("Protecció ignífuga amb morter, plaques o pintura intumescent");
    }

    const compliance = true; // Sempre es pot complir amb el disseny adequat

    setResults({
      requiredResistance,
      structuralStability,
      sectioning,
      compliance,
      recommendations,
    });

    toast({
      title: "Càlcul completat",
      description: "Resistència al foc determinada segons normativa",
      variant: "default",
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
              <Settings className="h-5 w-5 text-muted-foreground" />
              Resistència al foc de l'estructura
            </CardTitle>
            <CardDescription>
              Característiques estructurals per determinar resistència requerida
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="structureType">Tipus d'estructura</Label>
              <Select value={formData.structureType} onValueChange={(value) => handleInputChange("structureType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipus" />
                </SelectTrigger>
                <SelectContent>
                  {structureTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="loadLevel">Nivell de sobrecàrrega</Label>
              <Select value={formData.loadLevel} onValueChange={(value) => handleInputChange("loadLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el nivell" />
                </SelectTrigger>
                <SelectContent>
                  {loadLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="structuralElement">Element estructural</Label>
              <Select value={formData.structuralElement} onValueChange={(value) => handleInputChange("structuralElement", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona l'element" />
                </SelectTrigger>
                <SelectContent>
                  {structuralElements.map(element => (
                    <SelectItem key={element.value} value={element.value}>
                      {element.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exposedSurface">Superfície exposada (m²)</Label>
              <Input
                id="exposedSurface"
                type="number"
                value={formData.exposedSurface}
                onChange={(e) => handleInputChange("exposedSurface", e.target.value)}
                placeholder="0"
              />
            </div>

            <Button 
              onClick={calculateFireResistance} 
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              Calcular resistència SI 6
            </Button>
          </CardContent>
        </Card>

        {/* Resultats */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Resistència requerida SI 6
            </CardTitle>
            <CardDescription>
              Resistència al foc necessària per l'estructura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.requiredResistance && (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Resistència elements:</span>
                    <Badge variant="secondary">{results.requiredResistance}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Estabilitat estructural:</span>
                    <Badge variant="outline">{results.structuralStability}</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Compartimentació:</span>
                    <Badge variant="outline">{results.sectioning}</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Compliment:</span>
                    <Badge variant="default">DETERMINAT</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Significat:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>R:</strong> Capacitat portant</p>
                    <p><strong>E:</strong> Integritat</p>
                    <p><strong>I:</strong> Aïllament tèrmic</p>
                    <p><strong>Número:</strong> Temps en minuts</p>
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

export default SI6Component;