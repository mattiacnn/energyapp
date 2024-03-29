import { useLocation, Navigate, Outlet } from "react-router-dom"
import { useGetMeClientQuery } from "features/client/clientApiSlice"


const RequireClientAuth = () => {
  const { data: client, isLoading, isFetching } = useGetMeClientQuery({})

  const location = useLocation()

  const verifyIfclientNeedsToCompleteInfo = () => {
    // check if the client has already completed the info
    const { client_uuid, address, city, postal_code, avatar, country, state, } = client;
    if (!client_uuid || !address || !city || !postal_code || !country || !state) {
      if (location.pathname !== "/client/info/add-info-1" && location.pathname !== "/client/info/add-info-2" && location.pathname !== "/client/info/add-info-3" && location.pathname !== "/client/info/upload") {
        return true
      } else {
        return false
      }
    }
  }

  if (isLoading || isFetching) return null

  return (
    client && !verifyIfclientNeedsToCompleteInfo()
      ? <>
        <Outlet />
      </>
      : client && verifyIfclientNeedsToCompleteInfo()
        ?
        <Navigate to="/client/info/add-info-1" state={{ from: location }} replace />
        :
        <Navigate to="/login-client" state={{ from: location }} replace />
  )
}
export default RequireClientAuth