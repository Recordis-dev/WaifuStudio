#!/bin/bash
echo "============================================================"
echo " WAIFU - Actualizador (solo instalaciones Git)"
echo " Detiene la app, hace backup, git pull e install.sh."
echo " No actualiza instalaciones ZIP."
echo "============================================================"
echo

bash "$(dirname "$0")/install/update.sh" "$@"
EXITCODE=$?
echo

if [ "$EXITCODE" == "0" ]; then
  echo "Actualizacion terminada."
else
  echo "La actualizacion fallo con codigo $EXITCODE."
fi
exit $EXITCODE
