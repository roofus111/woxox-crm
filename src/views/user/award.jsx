'use client'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

// Third-party Components
import classnames from 'classnames'

const Award = () => {
    // Hooks
    const theme = useTheme()

    return (
        <Card className='relative bs-full'>
            <CardContent>
                <div className='flex flex-col items-start gap-2.5'>
                    <div className='flex flex-col'>
                        <Typography variant='h5'>
                            Welcome to WOXOX CRM  <br /><span className='font-bold'>Beta Program!</span> 🎉
                        </Typography>
                        <Typography variant='subtitle1'>Future CRM is here</Typography>
                    </div>
                    <Button href='https://www.woxox.com' size='small' variant='contained'>
                        Visit Our Website
                    </Button>
                </div>
                <img
                    src='/images/cards/trophy.png'
                    className={classnames('is-[106px] absolute block-end-0 inline-end-5', {
                        'scale-x-[-1]': theme.direction === 'rtl'
                    })}
                />
            </CardContent>
        </Card>
    )
}

export default Award
