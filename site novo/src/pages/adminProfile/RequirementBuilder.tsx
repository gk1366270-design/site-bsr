import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface RequirementBuilderProps {
  value: string;
  onChange: (value: string) => void;
}

const RequirementBuilder: React.FC<RequirementBuilderProps> = ({ value, onChange }) => {
  const [stat, setStat] = useState<string>('wins');
  const [operator, setOperator] = useState<string>('>=');
  const [valueInput, setValueInput] = useState<string>('1');
  const [customRequirement, setCustomRequirement] = useState<string>('');
  const [useCustom, setUseCustom] = useState<boolean>(false);

  // Parse the initial requirement value
  useEffect(() => {
    if (value) {
      const parts = value.split(/ (>=|<=|>|<|==) /);
      if (parts.length === 2) {
        const [statPart, valuePart] = parts;
        const operatorMatch = value.match(/ (>=|<=|>|<|==) /);
        if (operatorMatch) {
          setStat(statPart);
          setOperator(operatorMatch[1]);
          setValueInput(valuePart);
          setUseCustom(false);
        } else {
          setCustomRequirement(value);
          setUseCustom(true);
        }
      } else {
        setCustomRequirement(value);
        setUseCustom(true);
      }
    }
  }, [value]);

  // Update the requirement string whenever stat, operator, or value changes
  useEffect(() => {
    if (!useCustom) {
      const requirement = `${stat} ${operator} ${valueInput}`;
      onChange(requirement);
    }
  }, [stat, operator, valueInput, useCustom, onChange]);

  // Update the requirement string when custom requirement changes
  useEffect(() => {
    if (useCustom) {
      onChange(customRequirement);
    }
  }, [customRequirement, useCustom, onChange]);

  const handleAddRequirement = () => {
    setUseCustom(false);
  };

  const handleUseCustom = () => {
    setUseCustom(true);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Configuração de Requisito
      </Label>

      {!useCustom ? (
        <Card className="border border-gray-200 dark:border-gray-700 relative z-10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Requisito para Desbloqueio
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-visible">
            <div className="space-y-4 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end overflow-visible">
                <div className="space-y-2">
                  <Label htmlFor="stat" className="text-sm font-medium">
                    Estatística
                  </Label>
                  <Select value={stat} onValueChange={setStat}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecione estatística" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom">
                      <SelectItem value="wins">Vitórias</SelectItem>
                      <SelectItem value="podiums">Pódios</SelectItem>
                      <SelectItem value="points">Pontos</SelectItem>
                      <SelectItem value="races_participated">Corridas Participadas</SelectItem>
                      <SelectItem value="avg_speed">Velocidade Média</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operator" className="text-sm font-medium">
                    Condição
                  </Label>
                  <Select value={operator} onValueChange={setOperator}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecione condição" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom">
                      <SelectItem value=">=">Maior ou igual a</SelectItem>
                      <SelectItem value=">">Maior que</SelectItem>
                      <SelectItem value="<=">Menor ou igual a</SelectItem>
                      <SelectItem value="<">Menor que</SelectItem>
                      <SelectItem value="==">Igual a</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value" className="text-sm font-medium">
                    Valor
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    className="h-10"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-muted-foreground">
                  Requisito: <span className="font-semibold text-primary">{stat} {operator} {valueInput}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseCustom}
                  className="h-8 px-3 text-sm"
                >
                  <span className="font-medium">Usar Requisito Personalizado</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-200 dark:border-gray-700 relative z-10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Requisito Personalizado
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-visible">
            <div className="space-y-4 overflow-visible">
              <div className="space-y-2">
                <Label htmlFor="customRequirement" className="text-sm font-medium">
                  Requisito Personalizado
                </Label>
                <Input
                  id="customRequirement"
                  value={customRequirement}
                  onChange={(e) => setCustomRequirement(e.target.value)}
                  placeholder="Ex: wins >= 1"
                  className="h-10"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use a sintaxe: estatística operador valor (Ex: wins {'>='} 1, podiums == 10)
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-muted-foreground">
                  Requisito: <span className="font-semibold text-primary">{customRequirement}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRequirement}
                  className="h-8 px-3 text-sm"
                >
                  <span className="font-medium">Usar Configuração Simples</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="pt-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p><strong>Exemplos de requisitos:</strong></p>
          <ul className="list-disc list-inside space-y-0.5">
            <li><strong>wins {'>='} 1</strong> - Primeira vitória</li>
            <li><strong>podiums {'>='} 10</strong> - 10 pódios</li>
            <li><strong>points {'>='} 50</strong> - 50 pontos</li>
            <li><strong>races_participated {'>='} 20</strong> - 20 corridas participadas</li>
            <li><strong>avg_speed {'>='} 200</strong> - Velocidade média de 200 km/h</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RequirementBuilder;