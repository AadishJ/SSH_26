classdef Slice_To_SliceLayer1003 < nnet.layer.Layer & nnet.layer.Formattable
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
            name = 'backbone.coder.Slice_To_SliceLayer1003';
        end
    end


    methods
        function this = Slice_To_SliceLayer1003(name)
            this.Name = name;
            this.OutputNames = {'onnx__Add_509'};
        end

        function [onnx__Add_509] = predict(this, onnx__Slice_670)
            if isdlarray(onnx__Slice_670)
                onnx__Slice_670 = stripdims(onnx__Slice_670);
            end
            onnx__Slice_670NumDims = 4;
            onnx__Slice_670 = backbone.ops.permuteInputVar(onnx__Slice_670, [4 3 1 2], 4);

            [onnx__Add_509, onnx__Add_509NumDims] = Slice_To_SliceGraph1006(this, onnx__Slice_670, onnx__Slice_670NumDims, false);
            onnx__Add_509 = backbone.ops.permuteOutputVar(onnx__Add_509, [3 4 2 1], 4);

            onnx__Add_509 = dlarray(single(onnx__Add_509), 'SSCB');
        end

        function [onnx__Add_509] = forward(this, onnx__Slice_670)
            if isdlarray(onnx__Slice_670)
                onnx__Slice_670 = stripdims(onnx__Slice_670);
            end
            onnx__Slice_670NumDims = 4;
            onnx__Slice_670 = backbone.ops.permuteInputVar(onnx__Slice_670, [4 3 1 2], 4);

            [onnx__Add_509, onnx__Add_509NumDims] = Slice_To_SliceGraph1006(this, onnx__Slice_670, onnx__Slice_670NumDims, true);
            onnx__Add_509 = backbone.ops.permuteOutputVar(onnx__Add_509, [3 4 2 1], 4);

            onnx__Add_509 = dlarray(single(onnx__Add_509), 'SSCB');
        end

        function [onnx__Add_509, onnx__Add_509NumDims1007] = Slice_To_SliceGraph1006(this, onnx__Slice_670, onnx__Slice_670NumDims, Training)

            % Execute the operators:
            % Slice:
            [Indices, onnx__Slice_504NumDims] = backbone.ops.prepareSliceArgs(onnx__Slice_670, this.Vars.onnx__Slice_501, this.Vars.onnx__Slice_502, this.Vars.onnx__Slice_500, this.Vars.onnx__Slice_503, onnx__Slice_670NumDims);
            onnx__Slice_504 = onnx__Slice_670(Indices{:});

            % Slice:
            [Indices, onnx__Add_509NumDims] = backbone.ops.prepareSliceArgs(onnx__Slice_504, this.Vars.onnx__Slice_506, this.Vars.onnx__Slice_507, this.Vars.onnx__Slice_505, this.Vars.onnx__Slice_508, onnx__Slice_504NumDims);
            onnx__Add_509 = onnx__Slice_504(Indices{:});

            % Set graph output arguments
            onnx__Add_509NumDims1007 = onnx__Add_509NumDims;

        end

    end

end