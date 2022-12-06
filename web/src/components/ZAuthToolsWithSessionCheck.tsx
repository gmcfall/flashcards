import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectSession } from "../model/auth";
import authRegisterBegin from "../store/actions/authRegisterBegin";
import ZAuthTools from "./ZAuthTools";
import ZSessionCheck from "./ZSessionCheck";


export default function ZAuthToolsWithSessionCheck() {

    const dispatch = useAppDispatch();
    const session = useAppSelector(selectSession);

    const signInCancel = session ? undefined : () => {
        dispatch(authRegisterBegin())
    }

    return (
        <>        
            <ZSessionCheck/>
            <ZAuthTools disableRegisterCancel onCloseSignInDialog={signInCancel}/>
        </>
    )
}