import Spline from '@splinetool/react-spline';

interface SceneProps {
    scene: string;
}

export const Scene: React.FC<SceneProps> = ({ scene }) => {
    return <Spline scene={scene} />;
};
