enum lang {
  es,
  en,
}

export default class Locale {
  loginTitle = (lang: String = "es") => {
    return lang === "es" ? "Inicio de Sesión" : "Log In";
  };
  registerTitle = (lang: String = "es") => {
    return lang === "es" ? "Registro" : "Registration";
  };
  emailField = (lang: String = "es") => {
    return lang === "es" ? "Correo Electrónico" : "Email";
  };
  passwordField = (lang: String = "es") => {
    return lang === "es" ? "Contraseña" : "Password";
  };
  newPasswordField = (lang: String = "es") => {
    return lang === "es" ? "Nueva Contraseña" : "New Password";
  };
  passwordConfirmationField = (lang: String = "es") => {
    return lang === "es" ? "Confirmar Contraseña" : "Password Confirmation";
  };
  submitButton = (lang: String = "es") => {
    return lang === "es" ? "Acceder" : "Submit";
  };
  noAccountText = (lang: String = "es") => {
    return lang === "es"
      ? "Aún no tienes cuenta?"
      : "Don't have an account yet?";
  };
  alreadyAccountText = (lang: String = "es") => {
    return lang === "es" ? "Ya tienes una cuenta?" : "Already have an account?";
  };
  registerButton = (lang: String = "es") => {
    return lang === "es" ? "Regístrate" : "Register";
  };
  loginButton = (lang: String = "es") => {
    return lang === "es" ? "Inicia Sesión" : "LogIn";
  };
  forgotPasswordButton = (lang: String = "es") => {
    return lang === "es" ? "Olvidó su Contraseña?" : "Forgot Password?";
  };
  passwordRecoveryTitle = (lang: String = "es") => {
    return lang === "es" ? "Recuperación de Contraseña" : "Password Recovery";
  };
  validationCodeField = (lang: String = "es") => {
    return lang === "es" ? "Código de Validación" : "Validation Code";
  };
  recoveryCodeField = (lang: String = "es") => {
    return lang === "es" ? "Código de Recuperación" : "Recovery Code";
  };
  logoutPromptMessage = (lang: String = "es") => {
    return lang === "es"
      ? "Está seguro de cerrar sesión?"
      : "Are you sure to logout?";
  };
  sendButton = (lang: String = "es") => {
    return lang === "es" ? "Enviar" : "Send";
  };
  nameField = (lang: String = "es") => {
    return lang === "es" ? "Nombre" : "Name";
  };
  emptyNameMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar su nombre"
      : "You must enter your name";
  };
  emptyEmailMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar su correo electrónico"
      : "You must enter your email";
  };
  emptyPasswordMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar su contraseña"
      : "You must enter your password";
  };
  noLengthPasswordMsg = (lang: String = "es") => {
    return lang === "es"
      ? "La contraseña debe tener mínimo 8 caracteres"
      : "Password must be at least 8 characters";
  };
  invalidEmailMsg = (lang: String = "es") => {
    return lang === "es" ? "Correo electrónico inválido" : "Invalid email";
  };
  notMatchingPasswordsMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Las contraseñas deben coincidir"
      : "Passwords must match";
  };
  emailAlreadyRegisteredMsg = (lang: String = "es") => {
    return lang === "es"
      ? "El correo electrónico ya está registrado"
      : "Email already registered";
  };
  registerValidationTitle = (lang: String = "es") => {
    return lang === "es" ? "Validar Registro" : "Validate Registration";
  };
  registerValidationTitleMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Le hemos enviado un código de validación al correo electrónico suministrado, por favor ingrese los 8 dígitos del código en el siguiente campo:"
      : "We have sent a validation code to the email provided, please enter the 8 digits of the code in the following field:";
  };
  noLengthValidationCode = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar los 8 dígitos del código de validación"
      : "You must enter the 8 digits of the validation code";
  };
  noLengthRecoveryCode = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar los 8 dígitos del código de recuperación"
      : "You must enter the 8 digits of the recovery code";
  };
  invalidCodeMsg = (lang: String = "es") => {
    return lang === "es" ? "Código inválido" : "Invalid code";
  };
  erroOccurred = (lang: String = "es") => {
    return lang === "es" ? "Ha ocurrido un error" : "An error occurred";
  };
  invalidCredentials = (lang: String = "es") => {
    return lang === "es" ? "Credenciales inválidas" : "Invalid credentials";
  };
  recoveryPasswordOnEmailMsg = (lang: String = "es") => {
    return lang === "es" ? "Ingrese su correo electrónico" : "Enter your email";
  };
  recoveryPasswordOnCodeMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Le hemos enviado un código de recuperación al correo electrónico suministrado"
      : "We have sent a recovery code to the email provided";
  };
  recoveryPasswordOnPasswordlMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Ingrese su nueva contraseña"
      : "Enter your new password";
  };
  emailNotRegisteredMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Correo electrónico no registrado"
      : "Email not registered";
  };
  passwordUpdatedMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Su contraseña ha sido actualizada exitosamente"
      : "Your password has been successfully updated";
  };
  registerValidatedMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Su registro ha sido validado exitosamente. Ahora puede iniciar sesión"
      : "Your registration has been successfully validated. You can now log in";
  };
  welcome = (lang: String = "es") => {
    return lang === "es" ? "Bienvenido" : "Welcome";
  };
  homeTitle = (lang: String = "es") => {
    return lang === "es" ? "Inicio" : "Home";
  };
  devicesLabelText = (lang: String = "es") => {
    return lang === "es" ? "Dispositivos" : "Devices";
  };
  groupsLabelText = (lang: String = "es") => {
    return lang === "es" ? "Grupos" : "Groups";
  };
  groupLabelText = (lang: String = "es") => {
    return lang === "es" ? "Grupo" : "Group";
  };
  historyLabelText = (lang: String = "es") => {
    return lang === "es" ? "Historial" : "History";
  };
  alertsLabelText = (lang: String = "es") => {
    return lang === "es" ? "Alertas" : "Alerts";
  };
  toolsLabelText = (lang: String = "es") => {
    return lang === "es" ? "Herramientas" : "Tools";
  };
  settingsLabelText = (lang: String = "es") => {
    return lang === "es" ? "Configuración" : "Setting";
  };
  suggestionsLabelText = (lang: String = "es") => {
    return lang === "es" ? "Sugerencias" : "Suggestions";
  };
  logoutLabelText = (lang: String = "es") => {
    return lang === "es" ? "Cerrar Sesión" : "Log Out";
  };
  vehiclesLabelText = (lang: String = "es") => {
    return lang === "es" ? "Vehículos" : "Vehicles";
  };
  myProfileTitle = (lang: String = "es") => {
    return lang === "es" ? "Mi Perfil" : "My Profile";
  };
  searchField = (lang: String = "es") => {
    return lang === "es" ? "Buscar" : "Search";
  };
  expiresOnLabel = (lang: String = "es") => {
    return lang === "es" ? "Expira el" : "Expires on";
  };
  lastReportLabel = (lang: String = "es") => {
    return lang === "es" ? "Último reporte" : "Last report";
  };
  addNewDeviceTitle = (lang: String = "es") => {
    return lang === "es" ? "Agregar Nuevo Dispositivo" : "Add New Device";
  };
  editDeviceTitle = (lang: String = "es") => {
    return lang === "es" ? "Editar Dispositivo" : "Edit Device";
  };
  addNewGeofenceTitle = (lang: String = "es") => {
    return lang === "es" ? "Agregar Nueva Geocerca" : "Add New Geofence";
  };
  editGeofenceTitle = (lang: String = "es") => {
    return lang === "es" ? "Editar Geocerca" : "Edit Geofence";
  };
  deviceInfoTitle = (lang: String = "es") => {
    return lang === "es" ? "Información del Dispositivo" : "Device Info";
  };
  deviceModelLabel = (lang: String = "es") => {
    return lang === "es" ? "Modelo" : "Model";
  };
  selectPickerItemLabel = (lang: String = "es") => {
    return lang === "es" ? "Seleccione" : "Select";
  };
  deviceImeiLabel = (lang: String = "es") => {
    return lang === "es" ? "Imei" : "Imei";
  };
  simcardSectionTitle = (lang: String = "es") => {
    return lang === "es" ? "Información de la Tarjeta Sim" : "Sim Card Info";
  };
  simcardGsmNumberLabel = (lang: String = "es") => {
    return lang === "es" ? "Número Gsm" : "Gsm Number";
  };
  simcardCarrierLabel = (lang: String = "es") => {
    return lang === "es" ? "Operadora" : "Carrier";
  };
  simcardApnAddressLabel = (lang: String = "es") => {
    return lang === "es" ? "Apn" : "Apn";
  };
  simcardApnUserLabel = (lang: String = "es") => {
    return lang === "es" ? "Usuario" : "User";
  };
  simcardApnPassLabel = (lang: String = "es") => {
    return lang === "es" ? "Contraseña" : "Password";
  };
  vehicleSectionTitle = (lang: String = "es") => {
    return lang === "es" ? "Información del Vehículo" : "Vehicle Info";
  };
  vehicleDescriptionLabel = (lang: String = "es") => {
    return lang === "es" ? "Descripción" : "Description";
  };
  vehicleLicensePlateLabel = (lang: String = "es") => {
    return lang === "es" ? "Matrícula" : "License Plate";
  };
  vehicleDriverNameLabel = (lang: String = "es") => {
    return lang === "es" ? "Nombre del Conductor" : "Driver Name";
  };
  vehicleSpeedLimitLabel = (lang: String = "es") => {
    return lang === "es" ? "Límite de Velocidad" : "Speed Limit";
  };
  vehicleFuelConsumptionLabel = (lang: String = "es") => {
    return lang === "es"
      ? "Consumo de Combustible (Km por 1 Litro)"
      : "Fuel Consumption (Km per 1 Liter)";
  };
  vehicleFuelCostLabel = (lang: String = "es") => {
    return lang === "es"
      ? "Costo de Combustible (1 Litro)"
      : "Fuel Cost (1 Liter)";
  };
  additionalInfoSectionTitle = (lang: String = "es") => {
    return lang === "es" ? "Información Adicional" : "Additional Info";
  };
  languageLabelText = (lang: String = "es") => {
    return lang === "es" ? "Idioma" : "Language";
  };
  editButtonLabel = (lang: String = "es") => {
    return lang === "es" ? "Editar" : "Edit";
  };
  deleteButtonLabel = (lang: String = "es") => {
    return lang === "es" ? "Eliminar" : "Delete";
  };
  showOnMapButtonLabel = (lang: String = "es") => {
    return lang === "es" ? "Mostrar en Mapa" : "Show on Map";
  };
  removeFromMapButtonLabel = (lang: String = "es") => {
    return lang === "es" ? "Quitar del Mapa" : "Remove from Map";
  };
  sendCommandButtonLabel = (lang: String = "es") => {
    return lang === "es" ? "Enviar Comando" : "Send Command";
  };
  todayLocationsHistoryButtonLabel = (lang: String = "es") => {
    return lang === "es"
      ? "Historial de Ubicaciones de Hoy"
      : "Today's Location History";
  };
  todayAlertsHistoryButtonLabel = (lang: String = "es") => {
    return lang === "es"
      ? "Historial de Eventos de Hoy"
      : "Today's Event History";
  };
  cancelButtonLabel = (lang: String = "es") => {
    return lang === "es" ? "Cancelar" : "Cancel";
  };
  acceptButtonLabel = (lang: String = "es") => {
    return lang === "es" ? "Aceptar" : "Accept";
  };
  noDeviceModelSelectedMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Debe seleccionar un modelo de dispositivo"
      : "Must select a device model";
  };
  emptyDeviceImeiFieldMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar el imei del dispositivo"
      : "Must enter the device imei";
  };
  emptySimcardGsmNumberFieldMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar el número gsm de la tarjeta sim"
      : "Must enter the simcard gsm number";
  };
  emptySimcardCarrierFieldMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar la operadora de la tarjeta sim"
      : "Must enter the simcard carrier";
  };
  emptySimcardApnFieldMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar el apn de la tarjeta sim"
      : "Must enter the simcard apn";
  };
  emptyVehicleDescriptionFieldMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar la descripción del vehículo"
      : "Must enter the vehicle description";
  };
  emptyVehicleLicensePlateFieldMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar la matrícula del vehículo"
      : "Must enter the vehicle license plate";
  };
  deviceSavedSuccessfullyMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Dispositivo guardado exitosamente"
      : "Device successfully saved";
  };
  deviceUpdatedSuccessfullyMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Dispositivo actualizado exitosamente"
      : "Device successfully updated";
  };
  groupSavedSuccessfullyMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Grupo guardado exitosamente"
      : "Group successfully saved";
  };
  groupUpdatedSuccessfullyMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Grupo actualizado exitosamente"
      : "Group successfully updated";
  };
  markerIconLabel = (lang: String = "es") => {
    return lang === "es" ? "Ícono del Marcador" : "Marker Icon";
  };
  mapTypeStandardLabel = (lang: String = "es") => {
    return lang === "es" ? "Normal" : "Standard";
  };
  mapTypeLabel = (lang: String = "es") => {
    return lang === "es" ? "Tipo de Mapa" : "Map Type";
  };
  mapUtilitiesLabel = (lang: String = "es") => {
    return lang === "es" ? "Utilidades de Mapa" : "Map Utilities";
  };
  mapTypeSatelliteLabel = (lang: String = "es") => {
    return lang === "es" ? "Satélite" : "Satellite";
  };
  mapTypeHybridLabel = (lang: String = "es") => {
    return lang === "es" ? "Híbrido" : "Hybrid";
  };
  markerTailLabel = (lang: String = "es") => {
    return lang === "es" ? "Cola" : "Marker Tail";
  };
  poisLabel = (lang: String = "es") => {
    return lang === "es" ? "POI's" : "POI's";
  };
  geofencesLabel = (lang: String = "es") => {
    return lang === "es" ? "Geocercas" : "Geofences";
  };
  closeLabel = (lang: String = "es") => {
    return lang === "es" ? "Cerrar" : "Close";
  };
  deviceLabel = (lang: String = "es") => {
    return lang === "es" ? "Dispositivo" : "Device";
  };
  dateAndTimeLabel = (lang: String = "es") => {
    return lang === "es" ? "Fecha y Hora" : "Date and Time";
  };
  dateTimeLabel = (lang: String = "es") => {
    return lang === "es" ? "Fecha Hora" : "Date Time";
  };
  fromLabel = (lang: String = "es") => {
    return lang === "es" ? "Desde" : "From";
  };
  toLabel = (lang: String = "es") => {
    return lang === "es" ? "Hasta" : "To";
  };
  invalidDatesTitle = (lang: String = "es") => {
    return lang === "es" ? "Fechas Inválidas" : "Invalid Dates";
  };
  historyDetailsTitle = (lang: String = "es") => {
    return lang === "es" ? "Detalles de Historial" : "History Details";
  };
  historyTitle = (lang: String = "es") => {
    return lang === "es" ? "Historial" : "History";
  };
  dateFromGreaterDateToMessage = (lang: String = "es") => {
    return lang === "es"
      ? "Fecha y Hora 'Desde' debe ser menor que la Fecha y Hora 'Hasta'"
      : "Date and Time 'From' must be smaller than Date and Time 'To'";
  };
  tabBarLogsLabel = (lang: String = "es") => {
    return lang === "es" ? "Registros" : "Logs";
  };
  tabBarMapLabel = (lang: String = "es") => {
    return lang === "es" ? "Mapa" : "Map";
  };
  tabBarGraphLabel = (lang: String = "es") => {
    return lang === "es" ? "Gráfico" : "Chart";
  };
  deviceHistoryErrorMessage = (lang: String = "es") => {
    return lang === "es"
      ? "Ocurrió un error al cargar el historial del dispositivo"
      : "An error occurred while getting device history";
  };
  noDeviceHistoryTitle = (lang: String = "es") => {
    return lang === "es" ? "Sin historial" : "No history";
  };
  noDeviceHistoryMessage = (lang: String = "es") => {
    return lang === "es"
      ? "No se encontraron resultados"
      : "No results were found";
  };
  lineLabel = (lang: String = "es") => {
    return lang === "es" ? "Línea" : "Line";
  };
  speedLabel = (lang: String = "es") => {
    return lang === "es" ? "Velocidad" : "Speed";
  };
  recordLabel = (lang: String = "es") => {
    return lang === "es" ? "Registro" : "Record";
  };
  noDevicesToShowMessage = (lang: String = "es") => {
    return lang === "es"
      ? "No hay dispositivos para mostrar"
      : "No devices to show";
  };
  searchTypeLabel = (lang: String = "es") => {
    return lang === "es" ? "Tipo de Búsqueda" : "Search Type";
  };
  locationsPickerItemText = (lang: String = "es") => {
    return lang === "es" ? "Ubicaciones" : "Locations";
  };
  eventsPickerItemText = (lang: String = "es") => {
    return lang === "es" ? "Eventos" : "Events";
  };
  acAlarmLabel = (lang: String = "es") => {
    return lang === "es" ? "Alerta de Batería" : "AC Alarm";
  };
  lowBatteryLabel = (lang: String = "es") => {
    return lang === "es" ? "Batería Baja" : "Low Battery";
  };
  noGpsLabel = (lang: String = "es") => {
    return lang === "es" ? "No Gps" : "No Gps";
  };
  sensorAlarmLabel = (lang: String = "es") => {
    return lang === "es" ? "Alerta de Sensor" : "Sensor Alarm";
  };
  alertTypeLabel = (lang: String = "es") => {
    return lang === "es" ? "Tipo de Alerta" : "Alert Type";
  };
  timeLabel = (lang: String = "es") => {
    return lang === "es" ? "Tiempo" : "Time";
  };
  secondsLabel = (lang: String = "es") => {
    return lang === "es" ? "Segundos" : "Seconds";
  };
  accOnLabel = (lang: String = "es") => {
    return lang === "es" ? "Ignición ON" : "Ignition ON";
  };
  accOffLabel = (lang: String = "es") => {
    return lang === "es" ? "Ignición OFF" : "Ignition OFF";
  };
  distanceLabel = (lang: String = "es") => {
    return lang === "es" ? "Distancia" : "Distance";
  };
  maxSpeedLabel = (lang: String = "es") => {
    return lang === "es" ? "Velocidad máxima" : "Max speed";
  };
  movingTimeLabel = (lang: String = "es") => {
    return lang === "es" ? "Tiempo en movimiento" : "Moving time";
  };
  stoppedTimeLabel = (lang: String = "es") => {
    return lang === "es" ? "Tiempo detenido" : "Stopped time";
  };
  fuelConsumptionLabel = (lang: String = "es") => {
    return lang === "es" ? "Consumo de combustible" : "Fuel consumption";
  };
  litersLabel = (lang: String = "es") => {
    return lang === "es" ? "Litros" : "Liters";
  };
  addNewGroupTitle = (lang: String = "es") => {
    return lang === "es" ? "Agregar Nuevo Grupo" : "Add New Group";
  };
  editGroupTitle = (lang: String = "es") => {
    return lang === "es" ? "Editar Grupo" : "Edit Group";
  };
  noGroupsToShowMessage = (lang: String = "es") => {
    return lang === "es" ? "No hay grupos para mostrar" : "No groups to show";
  };
  noGeofencesToShowMessage = (lang: String = "es") => {
    return lang === "es"
      ? "No hay geocercas para mostrar"
      : "No geofences to show";
  };
  statusField = (lang: String = "es") => {
    return lang === "es" ? "Estado" : "Status";
  };
  enabledLabel = (lang: String = "es") => {
    return lang === "es" ? "Habilitado" : "Enabled";
  };
  groupNameEmptyMessage = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar el nombre del grupo"
      : "Must enter the group name";
  };
  groupDeletePromptTitle = (lang: String = "es") => {
    return lang === "es" ? "Eliminar Grupo" : "Delete Group";
  };
  groupDeletePromptQuestion = (lang: String = "es") => {
    return lang === "es"
      ? "Está seguro de eliminar el grupo"
      : "Are you sure to delete the group";
  };
  groupDuplicatedMessage = (lang: String = "es") => {
    return lang === "es"
      ? "Ya existe un grupo con el mismo nombre"
      : "There is already a group with the same name";
  };
  deviceDeletePromptTitle = (lang: String = "es") => {
    return lang === "es" ? "Eliminar Dispositivo" : "Delete Device";
  };
  deviceDeletePromptQuestion = (lang: String = "es") => {
    return lang === "es"
      ? "Está seguro de eliminar el dispositivo"
      : "Are you sure to delete the device";
  };
  groupDeviceDeletePromptTitle = (lang: String = "es") => {
    return lang === "es" ? "Quitar Dispositivos" : "Remove Devices";
  };
  groupDeviceDeletePromptQuestion = (lang: String = "es") => {
    return lang === "es"
      ? "Está seguro de quitar los dispositivos seleccionados del grupo"
      : "Are you sure to remove the selected devices from the group";
  };
  geofenceDeviceDeletePromptTitle = (lang: String = "es") => {
    return lang === "es" ? "Quitar Dispositivos" : "Remove Devices";
  };
  geofenceDeviceDeletePromptQuestion = (lang: String = "es") => {
    return lang === "es"
      ? "Está seguro de quitar los dispositivos seleccionados de la geocerca"
      : "Are you sure to remove the selected devices from the geofence";
  };
  groupAddDevicesTitle = (lang: String = "es") => {
    return lang === "es" ? "Agregar a" : "Add to";
  };
  groupAddDevicesPromptTitle = (lang: String = "es") => {
    return lang === "es" ? "Agregar Dispositivos" : "Add Devices";
  };
  groupAddDevicesPromptQuestion = (lang: String = "es") => {
    return lang === "es"
      ? "Está seguro de agregar los dispositivos seleccionados al grupo"
      : "Are you sure to add the selected devices to the group";
  };
  geofenceAddDevicesPromptTitle = (lang: String = "es") => {
    return lang === "es" ? "Agregar Dispositivos" : "Add Devices";
  };
  geofenceAddDevicesPromptQuestion = (lang: String = "es") => {
    return lang === "es"
      ? "Está seguro de agregar los dispositivos seleccionados a la geocerca"
      : "Are you sure to add the selected devices to the geofence";
  };
  allPluralText = (lang: String = "es") => {
    return lang === "es" ? "Todos" : "All";
  };
  allSingularText = (lang: String = "es") => {
    return lang === "es" ? "Todo" : "All";
  };
  geofenceNameLabel = (lang: String = "es") => {
    return lang === "es" ? "Nombre" : "Name";
  };
  geofenceDescriptionLabel = (lang: String = "es") => {
    return lang === "es" ? "Descripción" : "Description";
  };
  geofenceTypeLabel = (lang: String = "es") => {
    return lang === "es" ? "Tipo" : "Type";
  };
  geofenceColorLabel = (lang: String = "es") => {
    return lang === "es" ? "Color" : "Color";
  };
  geofencePolygonalLabel = (lang: String = "es") => {
    return lang === "es" ? "Poligonal" : "Polygonal";
  };
  geofenceCircularLabel = (lang: String = "es") => {
    return lang === "es" ? "Circular" : "Circular";
  };
  drawGeofenceLabel = (lang: String = "es") => {
    return lang === "es" ? "Dibujar Geocerca" : "Draw Geofence";
  };
  pointsLabel = (lang: String = "es") => {
    return lang === "es" ? "Puntos" : "Points";
  };
  centerLabel = (lang: String = "es") => {
    return lang === "es" ? "Centro" : "Center";
  };
  radiusLabel = (lang: String = "es") => {
    return lang === "es" ? "Radio" : "Radius";
  };
  emptyGeofenceNameMessage = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar el nombre de la geocerca"
      : "Must enter the geofence name";
  };
  emptyGeofenceDescriptionMessage = (lang: String = "es") => {
    return lang === "es"
      ? "Debe ingresar la descripción de la geocerca"
      : "Must enter the geofence description";
  };
  notEnoughGeofencePointsMessage = (lang: String = "es") => {
    return lang === "es"
      ? "La geocerca debe contener al menos 3 puntos"
      : "Geofence must have at least 3 points";
  };
  incompleteGeofenceCircularMessage = (lang: String = "es") => {
    return lang === "es"
      ? "La geocerca debe contener un centro y un radio"
      : "Geofence must have a center and radius";
  };
  duplicateGeofenceNameMessage = (lang: String = "es") => {
    return lang === "es"
      ? "Ya existe una geocerca con el nombre ingresado"
      : "There is already a geofence with the name entered";
  };
  geofenceSavedSuccessfullyMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Geocerca guardada exitosamente"
      : "Geofence successfully saved";
  };
  geofenceUpdatedSuccessfullyMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Geocerca actualizada exitosamente"
      : "Geofence successfully updated";
  };
  associatedDevicesLabel = (lang: String = "es") => {
    return lang === "es" ? "Dispositivos Asociados" : "Associated Devices";
  };
  geofenceDeletePromptTitle = (lang: String = "es") => {
    return lang === "es" ? "Eliminar Geocerca" : "Delete Geofnce";
  };
  geofenceDeletePromptQuestion = (lang: String = "es") => {
    return lang === "es"
      ? "Está seguro de eliminar la geocerca"
      : "Are you sure to delete the geofence";
  };
  associateToGeofenceTitle = (lang: String = "es") => {
    return lang === "es" ? "Asociar a geocerca" : "Associate to geofence";
  };
  associateToGroupTitle = (lang: String = "es") => {
    return lang === "es" ? "Asociar a grupo" : "Associate to group";
  };
  subjectTextLabel = (lang: String = "es") => {
    return lang === "es" ? "Asunto" : "Subject";
  };
  messageTextLabel = (lang: String = "es") => {
    return lang === "es" ? "Mensaje" : "Message";
  };
  suggestionSentSuccessfullyMsg = (lang: String = "es") => {
    return lang === "es"
      ? "Su mensaje ha sido enviado exitosamente"
      : "Your message has been successfully sent";
  };
  fromGalleryLabel = (lang: String = "es") => {
    return lang === "es" ? "Desde la Galería" : "From Gallery";
  };
  fromCameraLabel = (lang: String = "es") => {
    return lang === "es" ? "Desde la Cámara" : "From Camera";
  };
  latitudeText = (lang: String = "es") => {
    return lang === "es" ? "Latitud" : "Latitude";
  };
  longitudeText = (lang: String = "es") => {
    return lang === "es" ? "Longitud" : "Longitude";
  };
  dateText = (lang: String = "es") => {
    return lang === "es" ? "Fecha" : "Date";
  };
  timeText = (lang: String = "es") => {
    return lang === "es" ? "Hora" : "Time";
  };
  ignitionText = (lang: String = "es") => {
    return lang === "es" ? "Ignición" : "Ignition";
  };
  addressText = (lang: String = "es") => {
    return lang === "es" ? "Dirección" : "Address";
  };

}
