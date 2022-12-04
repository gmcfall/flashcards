import { useEffect } from 'react'
import { useAppDispatch } from "../hooks/hooks";
import authListen from '../store/actions/authListen';

export default function ZAuth() {

    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(authListen())
    }, [dispatch])

    return null;
}