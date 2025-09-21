import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Home, Building2, Users, Calculator, FileText, Download } from "lucide-react";
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

interface HomePageProps {
  onProjectDataChange: (data: ProjectData) => void;
  onGeneratePDF: () => void;
  projectData: ProjectData;
}

const HomePage = ({ onProjectDataChange, onGeneratePDF, projectData }: HomePageProps) => {
  const { toast } = useToast();
  const [isValid, setIsValid] = useState(false);

  const usosBuilding = [
    { value: "residential", label: "Residencial" },
    { value: "office", label: "Oficines" },
    { value: "commercial", label: "Comercial" },
    { value: "industrial", label: "Industrial" },
    { value: "educational", label: "Educatiu" },
    { value: "healthcare", label: "Sanitari" },
    { value: "hotel", label: "Hoteler" },
  ];

  const buildingLocations = [
    { value: "urban", label: "Urbà" },
    { value: "rural", label: "Rural" },
    { value: "industrial", label: "Polígon industrial" },
  ];

  const handleInputChange = (field: keyof ProjectData, value: string) => {
    const updatedData = { ...projectData, [field]: value };
    onProjectDataChange(updatedData);
    validateForm(updatedData);
  };

  const validateForm = (data: ProjectData) => {
    const requiredFields = ['projectName', 'usBuilding', 'totalSurface', 'evacuationHeight', 'floors', 'maxOccupancy', 'buildingLocation'];
    const isFormValid = requiredFields.every(field => data[field as keyof ProjectData] && data[field as keyof ProjectData].trim() !== '');
    
    const numericFields = ['totalSurface', 'evacuationHeight', 'floors', 'maxOccupancy'];
    const areNumericValid = numericFields.every(field => {
      const value = parseFloat(data[field as keyof ProjectData]);
      return !isNaN(value) && value > 0;
    });

    setIsValid(isFormValid && areNumericValid);
  };

  const handleValidateData = () => {
    if (isValid) {
      toast({
        title: "Dades validades correctament",
        description: "Pots procedir a consultar els resultats de cada SI",
        variant: "default",
      });
    } else {
      toast({
        title: "Error de validació",
        description: "Si us plau, omple tots els camps amb valors vàlids",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-medium bg-gradient-primary text-primary-foreground">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Home className="h-8 w-8" />
            <div>
              <CardTitle className="text-2xl">Dades generals del projecte</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Introdueix les dades bàsiques per realitzar els càlculs de tots els SI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulari principal */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Dades del projecte
            </CardTitle>
            <CardDescription>
              Informació general necessària per tots els càlculs SI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="projectName">Nom del projecte</Label>
                <FieldHelp content="Introdueix el nom identificatiu del projecte. Aquest nom apareixerà en tots els informes generats." />
              </div>
              <Input
                id="projectName"
                value={projectData.projectName}
                onChange={(e) => handleInputChange("projectName", e.target.value)}
                placeholder="Introdueix el nom del projecte"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="usBuilding">Ús principal de l'edifici</Label>
                <FieldHelp content="Selecciona l'ús predominant de l'edifici segons la classificació CTE. Això determinarà els requisits específics de cada SI." />
              </div>
              <Select value={projectData.usBuilding} onValueChange={(value) => handleInputChange("usBuilding", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona l'ús principal" />
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
                <div className="flex items-center gap-2">
                  <Label htmlFor="totalSurface">Superfície total (m²)</Label>
                  <FieldHelp content="Superfície construïda total de l'edifici en metres quadrats. Inclou totes les plantes." />
                </div>
                <Input
                  id="totalSurface"
                  type="number"
                  value={projectData.totalSurface}
                  onChange={(e) => handleInputChange("totalSurface", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="evacuationHeight">Alçada d'evacuació (m)</Label>
                  <FieldHelp content="Alçada en metres entre la planta d'evacuació de l'edifici i la més alta dels recorreguts d'evacuació." />
                </div>
                <Input
                  id="evacuationHeight"
                  type="number"
                  value={projectData.evacuationHeight}
                  onChange={(e) => handleInputChange("evacuationHeight", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="floors">Número de plantes</Label>
                  <FieldHelp content="Número total de plantes de l'edifici, incloent planta baixa, soterranis i altells." />
                </div>
                <Input
                  id="floors"
                  type="number"
                  value={projectData.floors}
                  onChange={(e) => handleInputChange("floors", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="maxOccupancy">Ocupació màxima</Label>
                  <FieldHelp content="Número màxim de persones que poden ocupar simultàniament l'edifici. Es calcula segons la taula 2.1 del CTE DB-SI." />
                </div>
                <Input
                  id="maxOccupancy"
                  type="number"
                  value={projectData.maxOccupancy}
                  onChange={(e) => handleInputChange("maxOccupancy", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="buildingLocation">Ubicació de l'edifici</Label>
                <FieldHelp content="Tipus d'entorn on està ubicat l'edifici. Això afecta els requisits d'accessibilitat dels bombers i altres aspectes." />
              </div>
              <Select value={projectData.buildingLocation} onValueChange={(value) => handleInputChange("buildingLocation", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la ubicació" />
                </SelectTrigger>
                <SelectContent>
                  {buildingLocations.map(location => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleValidateData}
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
              disabled={!isValid}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Validar dades del projecte
            </Button>
          </CardContent>
        </Card>

        {/* Resum i accions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Resum del projecte
            </CardTitle>
            <CardDescription>
              Estat actual de les dades introduïdes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectData.projectName && (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Projecte:</span>
                  <span className="text-sm">{projectData.projectName}</span>
                </div>
                
                {projectData.usBuilding && (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Ús:</span>
                    <Badge variant="secondary">
                      {usosBuilding.find(u => u.value === projectData.usBuilding)?.label}
                    </Badge>
                  </div>
                )}

                {projectData.totalSurface && (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Superfície:</span>
                    <Badge variant="outline">{projectData.totalSurface} m²</Badge>
                  </div>
                )}

                {projectData.evacuationHeight && (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Alçada:</span>
                    <Badge variant="outline">{projectData.evacuationHeight} m</Badge>
                  </div>
                )}

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Estat validació:</span>
                  <Badge variant={isValid ? "default" : "secondary"}>
                    {isValid ? "VÀLID" : "PENDENT"}
                  </Badge>
                </div>
              </div>
            )}

            <div className="pt-4 border-t space-y-3">
              <Button 
                onClick={onGeneratePDF}
                variant="outline" 
                className="w-full"
                disabled={!isValid}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generar informe PDF
              </Button>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Documentació de referència:</h4>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" asChild className="justify-start">
                    <a href="/CTE_DB_Si1.pdf" download className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Descarregar SI1 - Propagació interior
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="justify-start">
                    <a href="/CTE_DB_Si2.pdf" download className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Descarregar SI2 - Propagació exterior
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="justify-start">
                    <a href="/CTE_DB_Si6.pdf" download className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Descarregar SI6 - Resistència al foc
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;