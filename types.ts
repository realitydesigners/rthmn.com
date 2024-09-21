export interface Signal {
  id: string;
  pair: string;
  pattern_type: string;
  status: string;
  start_price: number | null;
  end_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  pattern_info: string;
  boxes: string;
}

export type CandleData = {
  timestamp: string;
  open: number;
  mid: {
    o: string;
    h: string;
    l: string;
    c: string;
  };
  high: number;
  low: number;
  close: number;
};

export interface Box {
  high: number;
  low: number;
  value: number;
  size: number;
}

export interface BoxSlice {
  timestamp: string;
  boxes: Box[];
}
