import React from "react";
import styles from "./styles.module.css";

const PairName: React.FC<{ pair: string }> = ({ pair }) => {
	const pairName = pair.substring(0, 7).replace(/_/g, "");
	return <div className={styles.pairName}>{pairName}</div>;
};

export default PairName;
