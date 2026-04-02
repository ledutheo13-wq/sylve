export interface VegType {
  name: string;
  kc: number;
}

export interface SimpleMethod {
  name: string;
  eff: number;
}

export interface EquipParam {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  def: number;
}

export interface DetailEquipment {
  name: string;
  params: EquipParam[];
}

export interface Zone {
  id: number;
  name: string;
  surface: number;
  vegType: number;
  kc: number;
  simpleMethod: number;
  detailEquip: string;
  detailParams: Record<string, number>;
}

export interface ZoneResult {
  zone: Zone;
  monthly: number[];
  annualVol: number;
  eff: number;
  equipName: string;
  peakHours: number | null;
  color: string;
}

export type EtpProfile = number[];

export type Mode = "simple" | "detail";
