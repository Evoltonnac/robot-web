import { SnackbarKey, useSnackbar } from 'notistack'
import IconButton from '@mui/material/IconButton'
import { Fragment, useEffect, useState } from 'react'
import { Close } from '@mui/icons-material'

interface NotificationProps {
    msg: string
    variant?: 'info' | 'default' | 'error' | 'success' | 'warning'
}

export type SendNotification = React.Dispatch<React.SetStateAction<NotificationProps | undefined>>

export const useNotification = (): SendNotification => {
    const [conf, setConf] = useState<NotificationProps>()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const action = (key: SnackbarKey) => (
        <Fragment>
            <IconButton
                onClick={() => {
                    closeSnackbar(key)
                }}
            >
                <Close />
            </IconButton>
        </Fragment>
    )
    useEffect(() => {
        conf &&
            enqueueSnackbar(conf.msg, {
                variant: conf.variant || 'info',
                autoHideDuration: 5000,
                action,
            })
    }, [conf])
    return setConf
}
