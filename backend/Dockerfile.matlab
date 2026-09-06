FROM mathworks/matlab:r2026a

USER root

RUN apt-get update \
    && apt-get install --no-install-recommends --yes wget ca-certificates sudo \
    && rm -rf /var/lib/apt/lists/*

USER matlab
WORKDIR /tmp

RUN wget -q https://www.mathworks.com/mpm/glnxa64/mpm \
    && chmod +x mpm \
    && MATLAB_ROOT="$(dirname "$(dirname "$(readlink -f "$(which matlab)")")")" \
    && sudo HOME="$HOME" ./mpm install \
    --destination="$MATLAB_ROOT" \
    --release=R2026a \
    --products Deep_Learning_Toolbox Image_Processing_Toolbox Deep_Learning_Toolbox_Converter_for_ONNX_Model_Format \
    && sudo rm -f mpm /tmp/mathworks_root.log

WORKDIR /home/matlab