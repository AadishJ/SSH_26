classdef Slice_To_SliceLayer1001 < nnet.layer.Layer & nnet.layer.Formattable
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
            name = 'backbone.coder.Slice_To_SliceLayer1001';
        end
    end


    methods
        function this = Slice_To_SliceLayer1001(name)
            this.Name = name;
            this.OutputNames = {'onnx__Add_385'};
        end

        function [onnx__Add_385] = predict(this, onnx__Slice_574)
            if isdlarray(onnx__Slice_574)
                onnx__Slice_574 = stripdims(onnx__Slice_574);
            end
            onnx__Slice_574NumDims = 4;
            onnx__Slice_574 = backbone.ops.permuteInputVar(onnx__Slice_574, [4 3 1 2], 4);

            [onnx__Add_385, onnx__Add_385NumDims] = Slice_To_SliceGraph1002(this, onnx__Slice_574, onnx__Slice_574NumDims, false);
            onnx__Add_385 = backbone.ops.permuteOutputVar(onnx__Add_385, [3 4 2 1], 4);

            onnx__Add_385 = dlarray(single(onnx__Add_385), 'SSCB');
        end

        function [onnx__Add_385] = forward(this, onnx__Slice_574)
            if isdlarray(onnx__Slice_574)
                onnx__Slice_574 = stripdims(onnx__Slice_574);
            end
            onnx__Slice_574NumDims = 4;
            onnx__Slice_574 = backbone.ops.permuteInputVar(onnx__Slice_574, [4 3 1 2], 4);

            [onnx__Add_385, onnx__Add_385NumDims] = Slice_To_SliceGraph1002(this, onnx__Slice_574, onnx__Slice_574NumDims, true);
            onnx__Add_385 = backbone.ops.permuteOutputVar(onnx__Add_385, [3 4 2 1], 4);

            onnx__Add_385 = dlarray(single(onnx__Add_385), 'SSCB');
        end

        function [onnx__Add_385, onnx__Add_385NumDims1003] = Slice_To_SliceGraph1002(this, onnx__Slice_574, onnx__Slice_574NumDims, Training)

            % Execute the operators:
            % Slice:
            [Indices, onnx__Slice_380NumDims] = backbone.ops.prepareSliceArgs(onnx__Slice_574, this.Vars.onnx__Slice_377, this.Vars.onnx__Slice_378, this.Vars.onnx__Slice_376, this.Vars.onnx__Slice_379, onnx__Slice_574NumDims);
            onnx__Slice_380 = onnx__Slice_574(Indices{:});

            % Slice:
            [Indices, onnx__Add_385NumDims] = backbone.ops.prepareSliceArgs(onnx__Slice_380, this.Vars.onnx__Slice_382, this.Vars.onnx__Slice_383, this.Vars.onnx__Slice_381, this.Vars.onnx__Slice_384, onnx__Slice_380NumDims);
            onnx__Add_385 = onnx__Slice_380(Indices{:});

            % Set graph output arguments
            onnx__Add_385NumDims1003 = onnx__Add_385NumDims;

        end

    end

end