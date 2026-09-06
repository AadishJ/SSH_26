classdef Slice_To_SliceLayer1000 < nnet.layer.Layer & nnet.layer.Formattable
    % A custom layer auto-generated while importing an ONNX network.

    %#ok<*PROPLC>
    %#ok<*NBRAK>
    %#ok<*INUSL>
    %#ok<*VARARG>
    properties (Learnable)
    end

    properties (State)
    end

    properties
        Vars
        NumDims
    end


    methods(Static, Hidden)
        % Specify the path to the class that will be used for codegen
        function name = matlabCodegenRedirect(~)
            name = 'backbone.coder.Slice_To_SliceLayer1000';
        end
    end


    methods
        function this = Slice_To_SliceLayer1000(name)
            this.Name = name;
            this.OutputNames = {'onnx__Add_343'};
        end

        function [onnx__Add_343] = predict(this, onnx__Slice_544)
            if isdlarray(onnx__Slice_544)
                onnx__Slice_544 = stripdims(onnx__Slice_544);
            end
            onnx__Slice_544NumDims = 4;
            onnx__Slice_544 = backbone.ops.permuteInputVar(onnx__Slice_544, [4 3 1 2], 4);

            [onnx__Add_343, onnx__Add_343NumDims] = Slice_To_SliceGraph1000(this, onnx__Slice_544, onnx__Slice_544NumDims, false);
            onnx__Add_343 = backbone.ops.permuteOutputVar(onnx__Add_343, [3 4 2 1], 4);

            onnx__Add_343 = dlarray(single(onnx__Add_343), 'SSCB');
        end

        function [onnx__Add_343] = forward(this, onnx__Slice_544)
            if isdlarray(onnx__Slice_544)
                onnx__Slice_544 = stripdims(onnx__Slice_544);
            end
            onnx__Slice_544NumDims = 4;
            onnx__Slice_544 = backbone.ops.permuteInputVar(onnx__Slice_544, [4 3 1 2], 4);

            [onnx__Add_343, onnx__Add_343NumDims] = Slice_To_SliceGraph1000(this, onnx__Slice_544, onnx__Slice_544NumDims, true);
            onnx__Add_343 = backbone.ops.permuteOutputVar(onnx__Add_343, [3 4 2 1], 4);

            onnx__Add_343 = dlarray(single(onnx__Add_343), 'SSCB');
        end

        function [onnx__Add_343, onnx__Add_343NumDims1001] = Slice_To_SliceGraph1000(this, onnx__Slice_544, onnx__Slice_544NumDims, Training)

            % Execute the operators:
            % Slice:
            [Indices, onnx__Slice_338NumDims] = backbone.ops.prepareSliceArgs(onnx__Slice_544, this.Vars.onnx__Slice_335, this.Vars.onnx__Slice_336, this.Vars.onnx__Slice_334, this.Vars.onnx__Slice_337, onnx__Slice_544NumDims);
            onnx__Slice_338 = onnx__Slice_544(Indices{:});

            % Slice:
            [Indices, onnx__Add_343NumDims] = backbone.ops.prepareSliceArgs(onnx__Slice_338, this.Vars.onnx__Slice_340, this.Vars.onnx__Slice_341, this.Vars.onnx__Slice_339, this.Vars.onnx__Slice_342, onnx__Slice_338NumDims);
            onnx__Add_343 = onnx__Slice_338(Indices{:});

            % Set graph output arguments
            onnx__Add_343NumDims1001 = onnx__Add_343NumDims;

        end

    end

end