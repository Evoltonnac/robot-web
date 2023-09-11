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

export const LogoText: React.FC<SvgIconProps> = (props) => {
    return (
        <SvgIcon {...props} viewBox="10 10 160 32">
            <g id="SvgjsG3050" fill="currentColor">
                <path d="M11.4 40 l0 -4.48 l0.72 -0.48 l-1.4 -5.4 l-3.64 0 l0 5.32 l0.84 0.56 l0 4.48 l-6.72 0 l0 -4.48 l0.84 -0.56 l0 -17.92 l-0.84 -0.56 l0 -4.48 l12.8 0 l3.72 3.72 l0 10.2 l-2.16 2.2 l1.72 6.68 l1 0.72 l0 4.48 l-6.88 0 z M7.08 24.6 l4.84 0 l0.76 -0.76 l0 -6.04 l-0.76 -0.76 l-4.84 0 l0 7.56 z M26.352000000000004 40 l-3.72 -3.72 l0 -20.56 l3.72 -3.72 l9.08 0 l3.72 3.72 l0 20.56 l-3.72 3.72 l-9.08 0 z M28.432000000000002 34.96 l4.92 0 l0.76 -0.76 l0 -16.4 l-0.76 -0.76 l-4.92 0 l-0.76 0.76 l0 16.4 z M43.864000000000004 40 l0 -4.48 l0.84 -0.56 l0 -17.92 l-0.84 -0.56 l0 -4.48 l12.52 0 l3.72 3.72 l0 8.24 l-2.04 2.04 l2.04 2.04 l0 8.24 l-3.72 3.72 l-12.52 0 z M49.744 34.96 l4.56 0 l0.76 -0.76 l0 -4.08 l-1.6 -1.6 l-3.72 0 l0 6.44 z M49.744 23.48 l3.72 0 l1.6 -1.6 l0 -4.08 l-0.76 -0.76 l-4.56 0 l0 6.44 z M68.536 40 l-3.72 -3.72 l0 -20.56 l3.72 -3.72 l9.08 0 l3.72 3.72 l0 20.56 l-3.72 3.72 l-9.08 0 z M70.616 34.96 l4.92 0 l0.76 -0.76 l0 -16.4 l-0.76 -0.76 l-4.92 0 l-0.76 0.76 l0 16.4 z M91.088 40 l0 -4.48 l0.84 -0.56 l0 -17.92 l-0.84 0 l-0.56 0.84 l-4.48 0 l0 -5.88 l16.8 0 l0 5.88 l-4.48 0 l-0.56 -0.84 l-0.84 0 l0 17.92 l0.84 0.56 l0 4.48 l-6.72 0 z M120.592 40 l-3.6 -23.04 l-0.72 -0.48 l0 -4.48 l5.04 0 l2.52 16.12 l2.52 -16.12 l4.76 0 l2.52 16.12 l2.52 -16.12 l5.04 0 l0 4.48 l-0.72 0.48 l-3.6 23.04 l-6.48 0 l-1.64 -10.6 l-1.68 10.6 l-6.48 0 z M145.10399999999998 40 l0 -4.48 l0.84 -0.56 l0 -17.92 l-0.84 -0.56 l0 -4.48 l14.56 0 l0 5.88 l-4.48 0 l-0.56 -0.84 l-3.64 0 l0 6.44 l6.44 0 l0 5.04 l-6.44 0 l0 6.44 l3.64 0 l0.56 -0.84 l4.48 0 l0 5.88 l-14.56 0 z M164.37599999999998 40 l0 -4.48 l0.84 -0.56 l0 -17.92 l-0.84 -0.56 l0 -4.48 l12.52 0 l3.72 3.72 l0 8.24 l-2.04 2.04 l2.04 2.04 l0 8.24 l-3.72 3.72 l-12.52 0 z M170.256 34.96 l4.56 0 l0.76 -0.76 l0 -4.08 l-1.6 -1.6 l-3.72 0 l0 6.44 z M170.256 23.48 l3.72 0 l1.6 -1.6 l0 -4.08 l-0.76 -0.76 l-4.56 0 l0 6.44 z"></path>
            </g>
        </SvgIcon>
    )
}
