import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Race {
  id: number;
  title: string;
  date: string;
  track: string;
  status: string;
}

interface ProfileRacesProps {
  myRaces: Race[];
}

const ProfileRaces = ({ myRaces }: ProfileRacesProps) => {
  const navigate = useNavigate();

  return (
    <>
      {myRaces.length > 0 ? (
        myRaces.map((race, index) => (
          <Card key={race.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{race.title}</h3>
                  <p className="text-sm text-muted-foreground">{race.track} • {race.date}</p>
                </div>
                <Badge variant={race.status === 'upcoming' ? 'default' : 'secondary'}>
                  {race.status === 'upcoming' ? 'Próxima' : 'Concluída'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma corrida inscrita ainda.</p>
            <Button className="mt-4" onClick={() => navigate('/races')}>
              Ver Corridas Disponíveis
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ProfileRaces;