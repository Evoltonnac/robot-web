import { SvgIcon, SvgIconProps } from '@mui/material'

export const RobotIcon: React.FC<SvgIconProps> = (props) => {
    return (
        <SvgIcon {...props} viewBox="0 0 1024 1024">
            <path
                d="M752 848a16 16 0 0 1 16 16v64a16 16 0 0 1-16 16H288a16 16 0 0 1-16-16v-64a16 16 0 0 1 16-16h464zM896 96a64 64 0 0 1 63.936 60.8L960 160V704a64 64 0 0 1-60.8 63.936L896 768H144a64 64 0 0 1-63.936-60.8L80 704V160a64 64 0 0 1 60.8-63.936l3.2-0.064H896zM864 192H176v480H864V192zM448 320v240H352V320H448z m240 0v240h-96V320h96z"
                fill="currentColor"
                p-id="635"
            ></path>
        </SvgIcon>
    )
}

export const LoadingBalls: React.FC<SvgIconProps> = (props) => {
    return (
        <SvgIcon {...props} viewBox="0 25 100 50">
            <g transform="translate(25 50)">
                <circle cx="0" cy="0" r="6" fill="currentColor">
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        begin="-0.49751243781094523s"
                        calcMode="spline"
                        keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
                        values="0;1;0"
                        keyTimes="0;0.5;1"
                        dur="1.4925373134328357s"
                        repeatCount="indefinite"
                    ></animateTransform>
                </circle>
            </g>
            <g transform="translate(50 50)">
                <circle cx="0" cy="0" r="6" fill="currentColor">
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        begin="-0.24875621890547261s"
                        calcMode="spline"
                        keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
                        values="0;1;0"
                        keyTimes="0;0.5;1"
                        dur="1.4925373134328357s"
                        repeatCount="indefinite"
                    ></animateTransform>
                </circle>
            </g>
            <g transform="translate(75 50)">
                <circle cx="0" cy="0" r="6" fill="currentColor">
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        begin="0s"
                        calcMode="spline"
                        keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
                        values="0;1;0"
                        keyTimes="0;0.5;1"
                        dur="1.4925373134328357s"
                        repeatCount="indefinite"
                    ></animateTransform>
                </circle>
            </g>
        </SvgIcon>
    )
}
