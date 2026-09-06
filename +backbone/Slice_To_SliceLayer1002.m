classdef Slice_To_SliceLayer1002 < nnet.layer.Layer & nnet.layer.Formattable
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
            name = 'backbone.coder.Slice_To_SliceLayer1002';
        end
    end


    methods
        function this = Slice_To_SliceLayer1002(name)
            this.Name = name;
            this.OutputNames = {'onnx__Add_437'};
        end

        function [onnx__Add_437] = predict(this, onnx__Slice_613)
            if isdlarray(onnx__Slice_613)
                onnx__Slice_613 = stripdims(onnx__Slice_613);
            end
            onnx__Slice_613NumDims = 4;
            onnx__Slice_613 = backbone.ops.permuteInputVar(onnx__Slice_613, [4 3 1 2], 4);

            [onnx__Add_437, onnx__Add_437NumDims] = Slice_To_SliceGraph1004(this, onnx__Slice_613, onnx__Slice_613NumDims, false);
            onnx__Add_437 = backbone.ops.permuteOutputVar(onnx__Add_437, [3 4 2 1], 4);

            onnx__Add_437 = dlarray(single(onnx__Add_437), 'SSCB');
        end

        function [onnx__Add_437] = forward(this, onnx__Slice_613)
            if isdlarray(onnx__Slice_613)
                onnx__Slice_613 = stripdims(onnx__Slice_613);
            end
            onnx__Slice_613NumDims = 4;
            onnx__Slice_613 = backbone.ops.permuteInputVar(onnx__Slice_613, [4 3 1 2], 4);

            [onnx__Add_437, onnx__Add_437NumDims] = Slice_To_SliceGraph1004(this, onnx__Slice_613, onnx__Slice_613NumDims, true);
            onnx__Add_437 = backbone.ops.permuteOutputVar(onnx__Add_437, [3 4 2 1], 4);

            onnx__Add_437 = dlarray(single(onnx__Add_437), 'SSCB');
        end

        function [onnx__Add_437, onnx__Add_437NumDims1005] = Slice_To_SliceGraph1004(this, onnx__Slice_613, onnx__Slice_613NumDims, Training)

            % Execute the operators:
            % Slice:
            [Indices, onnx__Slice_432NumDims] = backbone.ops.prepareSliceArgs(onnx__Slice_613, this.Vars.onnx__Slice_429, this.Vars.onnx__Slice_430, this.Vars.onnx__Slice_428, this.Vars.onnx__Slice_431, onnx__Slice_613NumDims);
            onnx__Slice_432 = onnx__Slice_613(Indices{:});

            % Slice:
            [Indices, onnx__Add_437NumDims] = backbone.ops.prepareSliceArgs(onnx__Slice_432, this.Vars.onnx__Slice_434, this.Vars.onnx__Slice_435, this.Vars.onnx__Slice_433, this.Vars.onnx__Slice_436, onnx__Slice_432NumDims);
            onnx__Add_437 = onnx__Slice_432(Indices{:});

            % Set graph output arguments
            onnx__Add_437NumDims1005 = onnx__Add_437NumDims;

        end

    end

end