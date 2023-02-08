import { useSessionUser } from '../hooks/customHooks';

export default function ZAuth() {
    useSessionUser();
    return null;
}