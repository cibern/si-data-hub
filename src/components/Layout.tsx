import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Building, Users, Shield, Truck, Settings } from "lucide-react";
import SI1Component from "./sections/SI1Component";
import SI2Component from "./sections/SI2Component";
import SI3Component from "./sections/SI3Component";
import SI4Component from "./sections/SI4Component";
import SI5Component from "./sections/SI5Component";
import SI6Component from "./sections/SI6Component";

const Layout = () => {
  const [activeTab, setActiveTab] = useState("si1");

  const sections = [
    {
      id: "si1",
      title: "SI 1",
      subtitle: "Propagació interior",
      description: "Limitació del risc de propagació d'incendi per l'interior",
      icon: Flame,
      color: "text-destructive",
      component: SI1Component,
    },
    {
      id: "si2", 
      title: "SI 2",
      subtitle: "Propagació exterior",
      description: "Limitació del risc de propagació d'incendi per l'exterior",
      icon: Building,
      color: "text-warning",
      component: SI2Component,
    },
    {
      id: "si3",
      title: "SI 3", 
      subtitle: "Evacuació d'ocupants",
      description: "Càlculs d'aforament i sortides d'emergència",
      icon: Users,
      color: "text-primary",
      component: SI3Component,
    },
    {
      id: "si4",
      title: "SI 4",
      subtitle: "Instal·lacions de protecció",
      description: "Sistemes de protecció contra incendis",
      icon: Shield,
      color: "text-success",
      component: SI4Component,
    },
    {
      id: "si5",
      title: "SI 5",
      subtitle: "Intervenció dels bombers",
      description: "Accessibilitat i condicions d'intervenció",
      icon: Truck,
      color: "text-accent-foreground",
      component: SI5Component,
    },
    {
      id: "si6",
      title: "SI 6",
      subtitle: "Resistència al foc",
      description: "Resistència al foc de l'estructura",
      icon: Settings,
      color: "text-muted-foreground",
      component: SI6Component,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card shadow-soft border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-primary rounded-lg shadow-medium">
              <Flame className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">CTE DB-SI</h1>
              <p className="text-muted-foreground">Calculadora de Seguretat en cas d'Incendi</p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              v2025.1
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-6 bg-card shadow-soft p-2 h-auto">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-smooth"
                  >
                    <IconComponent className={`h-5 w-5 ${section.color} data-[state=active]:text-primary-foreground`} />
                    <div className="text-center">
                      <div className="font-semibold">{section.title}</div>
                      <div className="text-xs opacity-75">{section.subtitle}</div>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {sections.map((section) => {
            const Component = section.component;
            return (
              <TabsContent key={section.id} value={section.id} className="space-y-6">
                <Card className="shadow-medium">
                  <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <section.icon className="h-6 w-6" />
                      <div>
                        <CardTitle className="text-xl">{section.title} - {section.subtitle}</CardTitle>
                        <CardDescription className="text-primary-foreground/80">
                          {section.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Component />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
};

export default Layout;