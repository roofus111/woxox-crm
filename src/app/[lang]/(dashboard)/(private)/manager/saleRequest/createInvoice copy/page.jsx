'use client'
import { useSearchParams } from 'next/navigation'

const CreateInvoice = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')


    return (
        <h1>Create Invoice</h1>
    )
}

export default CreateInvoice
