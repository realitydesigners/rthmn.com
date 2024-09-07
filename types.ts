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
