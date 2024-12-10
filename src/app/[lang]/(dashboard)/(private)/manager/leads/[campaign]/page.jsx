'use client'
import { usePathname, useSearchParams } from 'next/navigation';

const ProductPage = () => {
    const pathname = usePathname(); // Gets the current path
    const searchParams = useSearchParams(); // Gets the search parameters

    return (
        <div>
            <h1>Current Path: {pathname}</h1>
            <p>Search Params: {JSON.stringify(Object.fromEntries(searchParams.entries()))}</p>
        </div>
    );
};

export default ProductPage;
