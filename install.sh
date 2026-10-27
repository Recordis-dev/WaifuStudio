#!/bin/bash
if [[ "$1" == "-Update" || "$1" == "-update" ]]; then
  bash "$(dirname "$0")/update.sh"
  exit $?
fi

echo "============================================================"
echo " WAIFU - Installer (console)"
echo " Installs engine + app deps + FFmpeg + ~106 GB of models."
echo " Needs ~150 GB free (minimal install without models: ~25 GB)."
echo " Safe to re-run: only missing components are installed."
echo " To update an existing Git install: bash install.sh -Update"
echo "============================================================"
echo

bash "$(dirname "$0")/install/install.sh" "$@"
EXITCODE=$?
echo

SUCCESS=0
if [ "$EXITCODE" == "0" ] || [ "$EXITCODE" == "2" ]; then
  SUCCESS=1
fi

if [ "$SUCCESS" == "1" ]; then
  echo "Done. Next steps:"
  echo "   1) start.sh        (starts engine + app + window)"
  echo "   2) healthcheck.sh  (optional: paths/services diagnostics)"
  echo "   3) stop.sh         (stops app + engine)"
  if [ "$EXITCODE" == "2" ]; then
    echo
    echo "Reminder: optional Civitai models are manual downloads."
  fi
else
  echo "Installer exited with code $EXITCODE. Check the messages above."
fi
