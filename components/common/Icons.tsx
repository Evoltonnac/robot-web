import { SvgIcon, SvgIconProps } from '@mui/material'

export const RobotIcon: React.FC<SvgIconProps> = (props) => {
    return (
        <SvgIcon {...props} viewBox="0 0 1024 1024">
            <path
                d="M752 848a16 16 0 0 1 16 16v64a16 16 0 0 1-16 16H288a16 16 0 0 1-16-16v-64a16 16 0 0 1 16-16h464zM896 96a64 64 0 0 1 63.936 60.8L960 160V704a64 64 0 0 1-60.8 63.936L896 768H144a64 64 0 0 1-63.936-60.8L80 704V160a64 64 0 0 1 60.8-63.936l3.2-0.064H896zM864 192H176v480H864V192zM448 320v240H352V320H448z m240 0v240h-96V320h96z"
                fill="htmlColor"
                p-id="635"
            ></path>
        </SvgIcon>
    )
}
